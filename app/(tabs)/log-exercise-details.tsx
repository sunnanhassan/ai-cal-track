import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft02Icon, Clock01Icon, Dumbbell02Icon, FireIcon, WorkoutRunIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { db } from '../../lib/firebase';
import { useUser } from '@clerk/clerk-expo';
import { calculateBurnedCaloriesAdvanced } from '../../lib/workout-math';

const DURATION_OPTIONS = [15, 30, 60, 90];
const INTENSITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function LogExerciseDetails() {
  const router = useRouter();
  const { user } = useUser();
  const { title, description } = useLocalSearchParams<{ title: string; description: string }>();
  
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [duration, setDuration] = useState<number | null>(30); // Default to 30 mins
  const [customDuration, setCustomDuration] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const displayTitle = title || 'Exercise';
  const displayDescription = description || 'Log your activity';

  const handleContinue = async () => {
    const finalDuration = duration !== null ? duration : parseInt(customDuration, 10);
    
    if (isNaN(finalDuration) || finalDuration <= 0) {
      alert("Please enter a valid duration");
      return;
    }

    if (!user) return;

    setIsCalculating(true);
    try {
      // 1. Fetch user demographic data securely from firestore
      const userRef = doc(db, 'users', user.id);
      const snap = await getDoc(userRef);
      
      let weightKg = 70; // Sensible default fallbacks
      let heightCm = 170; 
      let age = 30;
      let gender = 'Male';

      if (snap.exists()) {
        const data = snap.data();
        if (data.weight) weightKg = parseFloat(data.weight) || 70;
        
        // Height is stored as feet (e.g. 5.9), convering to cm:
        if (data.height) {
          const feet = parseFloat(data.height);
          if (!isNaN(feet)) {
            heightCm = feet * 30.48; // 1 foot = 30.48cm
          }
        }

        if (data.gender) gender = data.gender;

        if (data.birthDate) {
          const birthDate = new Date(data.birthDate);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          if (calculatedAge > 0) age = calculatedAge;
        }
      }
      
      // 2. Perform dynamic MET calculation using Mifflin-St Jeor BMR estimation
      const burned = calculateBurnedCaloriesAdvanced(
        finalDuration, 
        weightKg,
        heightCm,
        age,
        gender, 
        displayTitle, 
        intensity
      );
      
      // 3. Route to results
      router.push(`/(tabs)/log-exercise-result?calories=${burned}&duration=${finalDuration}&intensity=${intensity}&type=${encodeURIComponent(displayTitle)}`);
      
    } catch (e) {
      console.error(e);
      alert("An error occurred while calculating calories.");
    } finally {
      setIsCalculating(false);
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
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Selected Option Info */}
          <View style={styles.heroSection}>
            <View style={[styles.heroIconBox, { backgroundColor: displayTitle === 'Run' ? '#DBEAFE' : '#FEE2E2' }]}>
              {displayTitle === 'Run' ? (
                <WorkoutRunIcon size={40} color="#3B82F6" variant="stroke" />
              ) : (
                <Dumbbell02Icon size={40} color="#EF4444" variant="stroke" />
              )}
            </View>
            <Text style={styles.heroTitle}>{displayTitle}</Text>
            <Text style={styles.heroSubtitle}>{displayDescription}</Text>
          </View>

          {/* Intensity Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <FireIcon size={20} color={Colors.text} variant="stroke" />
              <Text style={styles.cardTitle}>Intensity</Text>
            </View>
            <Text style={styles.cardSubtitle}>How hard did you push yourself?</Text>
            
            <View style={styles.segmentedControl}>
              {INTENSITY_OPTIONS.map((opt) => {
                const isSelected = intensity === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    activeOpacity={0.7}
                    onPress={() => setIntensity(opt as any)}
                    style={[
                      styles.segmentButton,
                      isSelected && styles.segmentButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextActive
                    ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Duration Card */}
          <View style={[styles.card, { marginBottom: 120 }]}>
            <View style={styles.cardHeaderRow}>
              <Clock01Icon size={20} color={Colors.text} variant="stroke" />
              <Text style={styles.cardTitle}>Duration</Text>
            </View>
            <Text style={styles.cardSubtitle}>How long was your session?</Text>
            
            <View style={styles.chipsContainer}>
              {DURATION_OPTIONS.map((mins) => {
                const isSelected = duration === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    activeOpacity={0.7}
                    onPress={() => {
                      setDuration(mins);
                      setCustomDuration('');
                    }}
                    style={[
                      styles.chip,
                      isSelected && styles.chipActive
                    ]}
                  >
                    <Text style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive
                    ]}>
                      {mins} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.customDurationContainer}>
              <Text style={styles.customDurationLabel}>Or enter manually:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={customDuration}
                onChangeText={(text) => {
                  setCustomDuration(text);
                  if (text.length > 0) setDuration(null); // Clear chips if typing
                }}
              />
              <Text style={styles.minutesSuffix}>minutes</Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, isCalculating && { opacity: 0.7 }]} 
            activeOpacity={0.8}
            onPress={handleContinue}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentButtonActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.surface,
  },
  customDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  customDurationLabel: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
    marginRight: 16,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    width: 70,
    textAlign: 'center',
  },
  minutesSuffix: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: 12,
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
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  }
});
