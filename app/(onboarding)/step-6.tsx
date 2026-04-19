import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { Vitality } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function Step6() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [targetValue, setTargetValue] = useState(data.targetWeight?.toString() || '');

  const recommendedRange = useMemo(() => {
    if (!data.height) return null;
    
    // BMI = weight(kg) / height(m)^2
    // Normal range: 18.5 - 24.9
    const heightInMeters = data.height / 100;
    const minKg = 18.5 * (heightInMeters * heightInMeters);
    const maxKg = 24.9 * (heightInMeters * heightInMeters);

    if (data.weightUnit === 'lb') {
      const minLb = Math.round(minKg * 2.20462);
      const maxLb = Math.round(maxKg * 2.20462);
      return `${minLb}–${maxLb} lb`;
    }
    return `${Math.round(minKg)}–${Math.round(maxKg)} kg`;
  }, [data.height, data.weightUnit]);

  const handleContinue = () => {
    const numericTarget = parseFloat(targetValue);
    if (!isNaN(numericTarget)) {
      updateData({ targetWeight: numericTarget });
      router.push('/(onboarding)/step-7');
    }
  };

  return (
    <OnboardingScreenWrapper
      title="What's your target weight?"
      onContinue={handleContinue}
      continueDisabled={!targetValue || isNaN(parseFloat(targetValue))}
    >
      <View style={styles.content}>
        
        {recommendedRange && (
          <View style={styles.rangePillWrapper}>
            <View style={styles.rangePill}>
              <Ionicons name="shield-checkmark" size={16} color={Vitality.primary} style={styles.pillIcon} />
              <Text style={styles.pillText}>Healthy BMI Range: <Text style={styles.pillTextBold}>{recommendedRange}</Text></Text>
            </View>
          </View>
        )}

        <View style={styles.valueDisplayContainer}>
          <View style={styles.valueRow}>
            <TextInput
              style={styles.valueTextMassive}
              value={targetValue}
              onChangeText={setTargetValue}
              placeholder="e.g. 65"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              keyboardType="numeric"
              autoFocus
              maxLength={5}
            />
            
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                const next = data.weightUnit === 'kg' ? 'lb' : 'kg';
                updateData({ weightUnit: next, targetWeight: undefined });
                setTargetValue('');
              }}
              style={styles.inlineUnitToggle}
            >
              <Text style={styles.inlineUnitText}>{data.weightUnit}</Text>
              <Ionicons name="chevron-down" size={24} color={Vitality.primary} />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  rangePillWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  rangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(89, 222, 155, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(89, 222, 155, 0.2)',
  },
  pillIcon: {
    marginRight: 8,
  },
  pillText: {
    color: Vitality.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextBold: {
    color: Vitality.primary,
    fontWeight: '900',
  },
  valueDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  valueTextMassive: {
    fontSize: 80, 
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginRight: 8,
    minWidth: 100, 
    textAlign: 'center',
  },
  inlineUnitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  inlineUnitText: {
    fontSize: 28,
    fontWeight: '800',
    color: Vitality.primary,
    marginRight: 4,
    textTransform: 'lowercase',
  },
});
