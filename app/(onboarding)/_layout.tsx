import { Stack, usePathname } from 'expo-router';
import { createContext, useContext, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors } from '../../constants/Colors';

type OnboardingData = {
  gender?: string;
  goal?: string;
  workoutFrequency?: string;
  birthDate?: string;
  height?: string;
  weight?: string;
};

type OnboardingContextType = {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};

export default function OnboardingLayout() {
  const [data, setData] = useState<OnboardingData>({});

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const pathname = usePathname();
  let currentStep = 1;
  if (pathname.includes('step-2')) currentStep = 2;
  if (pathname.includes('step-3')) currentStep = 3;
  if (pathname.includes('step-4')) currentStep = 4;
  if (pathname.includes('step-5')) currentStep = 5;

  const isGenerating = pathname.includes('generating');

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        {!isGenerating && (
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <ProgressBar currentStep={currentStep} totalSteps={5} />
          </View>
        )}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
          <Stack.Screen name="step-1" />
          <Stack.Screen name="step-2" />
          <Stack.Screen name="step-3" />
          <Stack.Screen name="step-4" />
          <Stack.Screen name="step-5" />
          <Stack.Screen name="generating" options={{ gestureEnabled: false }} />
        </Stack>
      </SafeAreaView>
    </OnboardingContext.Provider>
  );
}
