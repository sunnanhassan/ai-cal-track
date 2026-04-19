import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { Vitality } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function Step5() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [ageText, setAgeText] = useState(data.age ? data.age.toString() : '25');

  const age = parseInt(ageText) || 25;

  const setAge = (val: number) => {
    setAgeText(val.toString());
    updateData({ age: val });
  };

  const increment = () => {
    if (age < 120) setAge(age + 1);
  };

  const decrement = () => {
    if (age > 10) setAge(age - 1);
  };

  const handleContinue = () => {
    updateData({ age });
    router.push('/(onboarding)/step-6');
  };

  return (
    <OnboardingScreenWrapper
      title="How old are you?"
      onContinue={handleContinue}
      continueDisabled={!ageText || isNaN(parseInt(ageText))}
    >
      <View style={styles.container}>
        
        <View style={styles.valueDisplayContainer}>
          <View style={styles.valueRow}>
            <TextInput
              style={styles.valueTextMassive}
              value={ageText}
              onChangeText={(text) => {
                setAgeText(text);
                const numeric = parseInt(text);
                if (!isNaN(numeric)) {
                  updateData({ age: numeric });
                }
              }}
              keyboardType="numeric"
              maxLength={3}
              autoFocus
            />
            <View style={styles.inlineUnitToggle}>
               <Text style={styles.inlineUnitText}>years</Text>
            </View>
          </View>
        </View>

        <View style={styles.stepperContainer}>
          <TouchableOpacity onPress={decrement} style={styles.stepperBtn}>
             <Ionicons name="remove" size={32} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.stepperDivider} />
          <TouchableOpacity onPress={increment} style={styles.stepperBtn}>
             <Ionicons name="add" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  valueDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
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
    textAlign: 'center',
    minWidth: 100,
  },
  inlineUnitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  inlineUnitText: {
    fontSize: 28,
    fontWeight: '800',
    color: Vitality.textMuted,
    textTransform: 'lowercase',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C21',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stepperBtn: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  stepperDivider: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
