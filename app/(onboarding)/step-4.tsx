import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { SelectionCard, OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';

export default function Step4() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleSelect = (gender: 'male' | 'female' | 'other') => {
    updateData({ gender });
  };

  return (
    <OnboardingScreenWrapper
      title="What's your gender?"
      subtitle="Used to ensure the highest accuracy for your metabolic calculations."
      onContinue={() => router.push('/(onboarding)/step-5')}
      continueDisabled={!data.gender}
    >
      <View style={styles.listContainer}>
        <SelectionCard
          title="Male"
          selected={data.gender === 'male'}
          onPress={() => handleSelect('male')}
          icon={<MaterialCommunityIcons name="gender-male" size={28} color={data.gender === 'male' ? Vitality.primary : Vitality.textMuted} />}
        />
        
        <SelectionCard
          title="Female"
          selected={data.gender === 'female'}
          onPress={() => handleSelect('female')}
          icon={<MaterialCommunityIcons name="gender-female" size={28} color={data.gender === 'female' ? Vitality.primary : Vitality.textMuted} />}
        />
        
        <SelectionCard
          title="Other"
          selected={data.gender === 'other'}
          onPress={() => handleSelect('other')}
          icon={<MaterialCommunityIcons name="gender-non-binary" size={28} color={data.gender === 'other' ? Vitality.primary : Vitality.textMuted} />}
        />
      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: 'column',
    gap: 0,
    marginTop: 16,
  },
});
