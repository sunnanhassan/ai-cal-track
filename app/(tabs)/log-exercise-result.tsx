import { useLocalSearchParams, useRouter } from 'expo-router';
import { FireIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useDateStore } from '../../lib/date-store';
import { addDailyLog } from '../../lib/tracking';
import { useUser } from '@clerk/clerk-expo';

export default function LogExerciseResult() {
  const router = useRouter();
  const { user } = useUser();
  const { selectedDate } = useDateStore();
  const { calories, duration, intensity, type } = useLocalSearchParams<{ 
    calories: string; 
    duration?: string; 
    intensity?: string; 
    type?: string; 
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const burnedValue = parseInt(calories || '0', 10);

  const handleLog = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const success = await addDailyLog(user.id, selectedDate, {
        name: type || 'Logged Exercise Burn',
        workoutType: type,
        duration: duration ? parseInt(duration, 10) : undefined,
        intensity: intensity,
        calories: 0,
        burnedCalories: burnedValue,
        protein: 0,
        fat: 0,
        carbs: 0,
        waterMl: 0
      });

      if (success) {
        // Just route back home so they can see the ring fill
        router.replace('/(tabs)');
      } else {
        alert("Failed to save. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred preserving your workout log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        
        {/* Massive Fire Icon Visualization */}
        <View style={styles.fireRing}>
          <View style={styles.fireCore}>
            <FireIcon size={80} color="#EF4444" variant="stroke" />
          </View>
        </View>

        <Text style={styles.title}>Your Workout Burned</Text>
        
        <View style={styles.calsContainer}>
          <Text style={styles.calsValue}>{burnedValue}</Text>
          <Text style={styles.calsUnit}>Cals</Text>
        </View>
        
        <Text style={styles.subtitle}>
          Excellent effort! This has been added to your daily allowance.
        </Text>

      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logButton, isSubmitting && styles.logButtonDisabled]} 
          activeOpacity={0.8}
          onPress={handleLog}
          disabled={isSubmitting}
        >
          <Text style={styles.logButtonText}>
            {isSubmitting ? 'Saving...' : 'Log Activity'}
          </Text>
        </TouchableOpacity>
        
        {!isSubmitting && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fireRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  fireCore: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  calsValue: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.text,
    includeFontPadding: false,
  },
  calsUnit: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  logButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logButtonDisabled: {
    opacity: 0.7,
  },
  logButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  }
});
