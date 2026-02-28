import { ClerkLoaded, ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import { checkLocalOnboarding, onboardingEmitter, saveUserToFirestore } from "../lib/auth-store";
import { tokenCache } from "../lib/cache";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      const checkOnboarding = async () => {
        // 1. Check local async storage first for a rapid response
        const isLocallyComplete = await checkLocalOnboarding(user.id);
        
        if (isLocallyComplete) {
          setIsOnboardingComplete(true);
        } else {
          // 2. If it's false or null, fall back to checking Firestore
          // This ensures the database is created, and fixes cases where the user clears their local storage
          const res = await saveUserToFirestore({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          });
          setIsOnboardingComplete(res.hasCompletedOnboarding);
        }
      };

      checkOnboarding();
    } else if (!isSignedIn) {
      setIsOnboardingComplete(null);
    }

    // Listen for the instant onboarding completion event to prevent loops
    const handleOnboardingComplete = () => setIsOnboardingComplete(true);
    onboardingEmitter.addEventListener('onboardingCompleted', handleOnboardingComplete);

    return () => {
      onboardingEmitter.removeEventListener('onboardingCompleted', handleOnboardingComplete);
    };
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!isLoaded || (isSignedIn && isOnboardingComplete === null)) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    const isGeneratingScreen = typeof window !== 'undefined' ? window.location?.pathname?.includes('generating') : false;
    
    // We do not want to redirect away from the generating screen while it works
    // @ts-ignore dynamic segment
    const isActuallyGenerating = segments.includes('generating');

    if (isSignedIn && isOnboardingComplete === false && !inOnboardingGroup) {
      router.replace('/(onboarding)/step-1' as any);
    } else if (isSignedIn && isOnboardingComplete === true && (inAuthGroup || (inOnboardingGroup && !isActuallyGenerating))) {
      router.replace('/(tabs)' as any);
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in' as any);
    }

    // Hide splash screen once routing is determined
    SplashScreen.hideAsync();
  }, [isSignedIn, isLoaded, segments, router, isOnboardingComplete]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
