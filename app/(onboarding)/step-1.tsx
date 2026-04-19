import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { SelectionCard, OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';

export default function Step1() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleSelect = (goal: 'lose' | 'maintain' | 'gain') => {
    updateData({ goal });
  };

  return (
    <OnboardingScreenWrapper
      title="What's your goal?"
      onContinue={() => router.push('/(onboarding)/step-2')}
      continueDisabled={!data.goal}
    >
      <View>
        <SelectionCard
          title="Lose weight"
          subtitle="Burn fat, feel lighter"
          selected={data.goal === 'lose'}
          onPress={() => handleSelect('lose')}
          icon={<MaterialCommunityIcons name="fire" size={32} color={data.goal === 'lose' ? Vitality.primary : Vitality.textMuted} />}
        />
        
        <SelectionCard
          title="Maintain weight"
          subtitle="Stay balanced and healthy"
          selected={data.goal === 'maintain'}
          onPress={() => handleSelect('maintain')}
          icon={<MaterialCommunityIcons name="heart-pulse" size={32} color={data.goal === 'maintain' ? Vitality.primary : Vitality.textMuted} />}
        />
        
        <SelectionCard
          title="Gain weight"
          subtitle="Build muscle, add mass"
          selected={data.goal === 'gain'}
          onPress={() => handleSelect('gain')}
          icon={<MaterialCommunityIcons name="arm-flex" size={32} color={data.goal === 'gain' ? Vitality.primary : Vitality.textMuted} />}
        />
      </View>
    </OnboardingScreenWrapper>
  );
}
