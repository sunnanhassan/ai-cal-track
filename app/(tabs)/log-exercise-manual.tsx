import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, FireIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { Colors } from '../../constants/Colors';
import { useDateStore } from '../../lib/date-store';
import { addDailyLog } from '../../lib/tracking';

export default function LogExerciseManual() {
  const router = useRouter();
  const { user } = useUser();
  const { selectedDate } = useDateStore();
  const [calories, setCalories] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLog = async () => {
    const totalCalories = parseInt(calories, 10);
    
    if (isNaN(totalCalories) || totalCalories <= 0) {
      alert("Please enter a valid calorie amount");
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      // Create a log entry specifically for burned calories.
      // This will increment `totalBurnedCalories` in Firebase.
      const success = await addDailyLog(user.id, selectedDate, {
        name: 'Manual Exercise Burn',
        calories: 0, 
        burnedCalories: Math.abs(totalCalories),
        protein: 0,
        fat: 0,
        carbs: 0,
        waterMl: 0
      });

      if (success) {
        alert(`Logged ${totalCalories} calories burned!`);
        router.replace('/(tabs)');
      } else {
        alert("Failed to save log. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft02Icon size={24} color={Colors.text} variant="stroke" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manual Entry</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <View style={styles.iconCircle}>
              <FireIcon size={40} color="#EF4444" variant="stroke" />
            </View>
            <Text style={styles.promptText}>How many calories did you burn?</Text>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={calories}
                onChangeText={setCalories}
                autoFocus
                maxLength={4}
              />
              <Text style={styles.unitText}>kcal</Text>
            </View>
          </View>
        </View>

        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.logButton, (!calories || isSubmitting) && styles.logButtonDisabled]} 
            activeOpacity={0.8}
            onPress={handleLog}
            disabled={!calories || isSubmitting}
          >
            <Text style={styles.logButtonText}>
              {isSubmitting ? 'Saving...' : 'Log Activity'}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // accommodate keyboard
  },
  inputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 8,
    paddingHorizontal: 16,
    minWidth: 150,
    justifyContent: 'center',
  },
  input: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    minWidth: 80,
    includeFontPadding: false,
    padding: 0,
  },
  unitText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 8,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.7,
  },
  logButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  }
});
