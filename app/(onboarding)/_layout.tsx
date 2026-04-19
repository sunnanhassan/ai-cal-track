import { Stack, usePathname } from 'expo-router';
import { createContext, useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Vitality } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export type OnboardingData = {
  goal?: 'lose' | 'maintain' | 'gain';
  weight?: number;
  weightUnit?: 'kg' | 'lb';
  height?: number; // Store in numeric (cm usually)
  heightUnit?: 'cm' | 'ft';
  gender?: 'male' | 'female' | 'other';
  age?: number;
  targetWeight?: number;
  pace?: 'mild' | 'moderate' | 'fast';
  notificationsEnabled?: boolean;
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
  const [data, setData] = useState<OnboardingData>({
    weightUnit: 'kg',
    heightUnit: 'cm',
    age: 25,
  });
  
  const router = useRouter();
  const pathname = usePathname();

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const getStepNumber = () => {
    const match = pathname.match(/step-(\d)/);
    return match ? parseInt(match[1]) : 1;
  };

  const currentStep = getStepNumber();
  const totalSteps = 9;

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Progress Bar & Back Button */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {currentStep > 1 ? (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Vitality.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
            
            <View style={styles.dotsContainer}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    i + 1 <= currentStep ? styles.activeDot : styles.inactiveDot
                  ]} 
                />
              ))}
            </View>
            
            <View style={styles.backPlaceholder} />
          </View>
        </View>

        <Stack 
          screenOptions={{ 
            headerShown: false, 
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'slide_from_right'
          }} 
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <Stack.Screen key={i} name={`step-${i + 1}`} />
          ))}
        </Stack>
      </SafeAreaView>
    </OnboardingContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Vitality.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backPlaceholder: {
    width: 44,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  activeDot: {
    backgroundColor: Vitality.primary,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
