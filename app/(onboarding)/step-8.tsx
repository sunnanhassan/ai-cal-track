import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

export default function Step8() {
  const router = useRouter();
  const { updateData } = useOnboarding();

  const handleAllow = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      updateData({ notificationsEnabled: status === 'granted' });
    } catch (error) {
      console.warn('Error requesting permissions:', error);
    }
    router.push('/(onboarding)/step-9');
  };

  const handleMaybeLater = () => {
    updateData({ notificationsEnabled: false });
    router.push('/(onboarding)/step-9');
  };

  return (
    <OnboardingScreenWrapper
      title="Never miss a beat"
      subtitle="Get timely reminders to log meals, hit your goals, and celebrate progress — every single day."
      onContinue={handleAllow}
      continueTitle="Allow notifications"
    >
      <View style={styles.container}>
        
        <View style={styles.glowWrapper}>
          <LinearGradient
            colors={['rgba(89, 222, 155, 0.2)', 'rgba(89, 222, 155, 0.0)']}
            style={styles.glowBg}
          />
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="bell-ring" size={60} color={Vitality.primary} />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleMaybeLater} 
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Maybe later</Text>
          <Text style={styles.skipSub}>You can enable this in settings anytime</Text>
        </TouchableOpacity>
      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  glowBg: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1C1C21',
    borderWidth: 1,
    borderColor: 'rgba(89, 222, 155, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Vitality.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  skipButton: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  skipText: {
    fontSize: 18,
    fontWeight: '700',
    color: Vitality.text,
    marginBottom: 8,
  },
  skipSub: {
    fontSize: 14,
    color: Vitality.textMuted,
  },
});
