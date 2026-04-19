import { ClerkLoaded, ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from "react";
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from "../context/ThemeContext";
import { checkLocalOnboarding, onboardingEmitter, saveUserToFirestore } from "../lib/auth-store";
import { tokenCache } from "../lib/cache";
import { 
  registerForPushNotificationsAsync, 
  scheduleDailyReminders, 
  seedAdminConfig,
  logNotificationToHistory 
} from "../lib/notificationService";
import { configureRevenueCat, identifyUser, logoutUser } from "../lib/revenuecat";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

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
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // 1. Seed admin config if it doesn't exist
    seedAdminConfig();

    // 2. Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
      if (user) {
        logNotificationToHistory(
          user.id,
          notification.request.content.title || 'Scheduled Reminder',
          notification.request.content.body || '',
          notification.request.content.data?.type || 'general'
        );
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification pressed');
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, [user]);

  useEffect(() => {
    configureRevenueCat();
  }, []);

  useEffect(() => {
    if (user) {
      identifyUser(user.id);
    } else if (!isSignedIn && isLoaded) {
      logoutUser();
    }
  }, [user, isSignedIn, isLoaded]);

  useEffect(() => {
    if (isSignedIn && user && isOnboardingComplete === true) {
      const setupNotifications = async () => {
        try {
          const userRef = doc(db, 'users', user.id);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            const notificationsEnabled = data.preferences?.notificationsEnabled ?? true;
            const isSubscribed = data.subscriptionStatus === 'premium' || data.isSubscribed === true;

            if (notificationsEnabled) {
              await registerForPushNotificationsAsync();
              await scheduleDailyReminders(user.id, isSubscribed);
            }
          }
        } catch (error) {
          console.error('Failed to setup notifications:', error);
        }
      };

      setupNotifications();
    }
  }, [isSignedIn, user, isOnboardingComplete]);

  useEffect(() => {
    if (isSignedIn && user) {
      const checkOnboarding = async () => {
        const isLocallyComplete = await checkLocalOnboarding(user.id);
        
        if (isLocallyComplete) {
          setIsOnboardingComplete(true);
        } else {
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
    const isIndex = segments.length === 0;

    const isActuallyGenerating = segments.includes('generating');

    console.log('Layout Navigation Check:', { isSignedIn, isLoaded, isOnboardingComplete, segments });

    if (isSignedIn && isOnboardingComplete === false && !inOnboardingGroup) {
      console.log('Redirecting to Onboarding');
      router.replace('/(onboarding)/step-1' as any);
    } else if (isSignedIn && isOnboardingComplete === true && (isIndex || inAuthGroup || (inOnboardingGroup && !isActuallyGenerating))) {
      console.log('Redirecting to Tabs');
      router.replace('/(tabs)' as any);
    } else if (!isSignedIn && (!inAuthGroup || isIndex)) {
      console.log('Redirecting to Sign In');
      router.replace('/(auth)/sign-in' as any);
    }

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
      <ThemeProvider>
        <ClerkLoaded>
          <InitialLayout />
        </ClerkLoaded>
      </ThemeProvider>
    </ClerkProvider>
  );
}
