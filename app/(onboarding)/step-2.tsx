import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { Vitality } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function Step2() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [weightValue, setWeightValue] = useState(data.weight?.toString() || '');

  const handleContinue = () => {
    const numericWeight = parseFloat(weightValue);
    if (!isNaN(numericWeight)) {
      updateData({ weight: numericWeight });
      router.push('/(onboarding)/step-3');
    }
  };

  return (
    <OnboardingScreenWrapper
      title="What's your current weight?"
      onContinue={handleContinue}
      continueDisabled={!weightValue || isNaN(parseFloat(weightValue))}
    >
      <View style={styles.content}>
        
        {/* Professional Value Display Input */}
        <View style={styles.valueDisplayContainer}>
          <View style={styles.valueRow}>
            <TextInput
              style={styles.valueTextMassive}
              value={weightValue}
              onChangeText={setWeightValue}
              placeholder="70"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              keyboardType="numeric"
              autoFocus
              maxLength={5}
            />
            
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                const next = data.weightUnit === 'kg' ? 'lb' : 'kg';
                updateData({ weightUnit: next });
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
    justifyContent: 'center', // Center vertically on the screen
    paddingBottom: 40,
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
    fontSize: 80, // Massive input text
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginRight: 8,
    minWidth: 100, // Keep cursor stable
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
