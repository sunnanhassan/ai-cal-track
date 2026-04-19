import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { Vitality } from '../../constants/Colors';
import { completeOnboarding, onboardingEmitter } from '../../lib/auth-store';
import { useUser } from '@clerk/clerk-expo';

export default function Step9() {
  const router = useRouter();
  const { user } = useUser();
  const { data } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const calorieData = useMemo(() => {
    // 1. Convert weight to kg
    const weightKg = data.weightUnit === 'lb' ? (data.weight || 0) / 2.20462 : (data.weight || 0);
    const heightCm = data.height || 170;
    const age = data.age || 25;
    
    // 2. MSJ Constant s
    let s = -78; // Default for Other
    if (data.gender === 'male') s = 5;
    if (data.gender === 'female') s = -161;

    // 3. BMR
    const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + s;
    
    // 4. TDEE (1.4 activity factor)
    const tdee = bmr * 1.4;

    // 5. Adjust for Pace
    let adjustment = 0;
    const paceMap = { mild: 250, moderate: 500, fast: 1000 };
    const paceVal = paceMap[data.pace || 'moderate'];

    if (data.goal === 'lose') adjustment = -paceVal;
    if (data.goal === 'gain') adjustment = paceVal;

    const finalCalories = Math.round(tdee + adjustment);

    // 6. Text bits
    const paceText = data.pace === 'mild' ? 'steady' : data.pace === 'moderate' ? 'balanced' : 'fast';
    const amountText = data.pace === 'mild' ? (data.weightUnit === 'lb' ? '0.5 lb' : '0.25 kg') : 
                      data.pace === 'moderate' ? (data.weightUnit === 'lb' ? '1 lb' : '0.5 kg') : 
                      (data.weightUnit === 'lb' ? '2 lb' : '1 kg');

    return {
      kcal: finalCalories,
      paceText,
      amountText,
      goalWord: data.goal === 'maintain' ? 'maintain weight' : `${data.goal} ${amountText}`,
      macros: {
        protein: Math.round((finalCalories * 0.30) / 4), // 30% Protein
        fats: Math.round((finalCalories * 0.30) / 9),    // 30% Fat
        carbs: Math.round((finalCalories * 0.40) / 4),   // 40% Carbs
      }
    };
  }, [data]);

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Save data to profile using completeOnboarding which handles dispatchEvent
      const success = await completeOnboarding(user.id, {
        goal: data.goal,
        weight: data.weight,
        weightUnit: data.weightUnit,
        height: data.height,
        heightUnit: data.heightUnit,
        gender: data.gender,
        age: data.age,
        targetWeight: data.targetWeight,
        pace: data.pace,
        dailyCalories: calorieData.kcal,
        targetProtein: calorieData.macros.protein,
        targetCarbs: calorieData.macros.carbs,
        targetFats: calorieData.macros.fats,
        preferences: {
          notificationsEnabled: data.notificationsEnabled ?? true,
        }
      });

      if (success) {
        // Redirect to Tabs
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScreenWrapper
      title="Your daily calorie goal"
      onContinue={handleFinish}
      continueTitle={loading ? 'Saving...' : 'Start my journey →'}
      continueDisabled={loading}
    >
      <View style={styles.container}>
        
        {/* Glowing Value Reveal */}
        <View style={styles.glowWrapper}>
          <View style={styles.glowBg} />
          <View style={styles.resultCard}>
            <Text style={styles.kcalNumber}>{calorieData.kcal.toLocaleString()}</Text>
            <Text style={styles.kcalUnit}>calories / day</Text>
          </View>
        </View>

        {/* Premium Flowing Typography */}
        <Text style={styles.explanationTextHero}>
          To {calorieData.goalWord} at a {calorieData.paceText} pace, aim for this target daily.
        </Text>
        
        <Text style={styles.explanationTextSub}>
          Calculated using your exact metabolic profile to guarantee consistent, safe results. You can always adjust this later.
        </Text>

        {loading && <ActivityIndicator size="large" color={Vitality.primary} style={styles.loader} />}
      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  glowWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  glowBg: {
    position: 'absolute',
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(89, 222, 155, 0.1)',
    borderRadius: 60,
    transform: [{ scaleX: 2 }],
    filter: [{ blur: 40 }] as any, // React native shadow approximation
  },
  resultCard: {
    alignItems: 'center',
    zIndex: 10,
  },
  kcalNumber: {
    fontSize: 90,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -3,
    textShadowColor: 'rgba(89, 222, 155, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  kcalUnit: {
    fontSize: 24,
    fontWeight: '800',
    color: Vitality.primary,
    marginTop: -8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  explanationTextHero: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  explanationTextSub: {
    fontSize: 15,
    color: Vitality.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 40,
  },
});
