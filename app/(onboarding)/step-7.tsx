import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { SelectionCard, OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';

export default function Step7() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  
  const goal = data.goal || 'maintain';
  const unit = data.weightUnit === 'lb' ? 'lb' : 'kg';

  const paceOptions = {
    gain: [
      { label: 'Mild weight gain', sub: `+0.25 ${unit}/week`, value: 'mild' },
      { label: 'Weight gain', sub: `+0.5 ${unit}/week`, value: 'moderate' },
      { label: 'Fast weight gain', sub: `+1 ${unit}/week`, value: 'fast' },
    ],
    lose: [
      { label: 'Mild weight loss', sub: `−0.25 ${unit}/week`, value: 'mild' },
      { label: 'Weight loss', sub: `−0.5 ${unit}/week`, value: 'moderate' },
      { label: 'Fast weight loss', sub: `−1 ${unit}/week`, value: 'fast' },
    ],
    maintain: [
      { label: 'Mild adjustment', sub: 'Balanced focus', value: 'mild' },
      { label: 'Moderate adjustment', sub: 'Health focus', value: 'moderate' },
      { label: 'Faster adjustment', sub: 'Energy focus', value: 'fast' },
    ]
  };

  const currentOptions = paceOptions[goal];

  const handleSelect = (pace: 'mild' | 'moderate' | 'fast') => {
    updateData({ pace });
  };

  const getGoalAction = () => {
    if (goal === 'lose') return 'lose';
    if (goal === 'gain') return 'gain';
    return 'adjust';
  };

  return (
    <OnboardingScreenWrapper
      title={`How quickly do you want to ${getGoalAction()} weight?`}
      onContinue={() => router.push('/(onboarding)/step-8')}
      continueDisabled={!data.pace}
    >
      <View style={{ gap: 12, marginTop: 16 }}>
        {currentOptions.map((opt) => (
          <SelectionCard
            key={opt.value}
            title={opt.label}
            subtitle={opt.sub}
            selected={data.pace === opt.value}
            onPress={() => handleSelect(opt.value as any)}
            icon={
              <MaterialCommunityIcons 
                name={getIcon(opt.value as any)} 
                size={32} 
                color={data.pace === opt.value ? Vitality.primary : Vitality.textMuted} 
              />
            }
          />
        ))}
      </View>
    </OnboardingScreenWrapper>
  );
}

const getIcon = (pace: 'mild' | 'moderate' | 'fast') => {
  switch (pace) {
    case 'mild': return 'speedometer-slow';
    case 'moderate': return 'speedometer-medium';
    case 'fast': return 'speedometer';
  }
};
