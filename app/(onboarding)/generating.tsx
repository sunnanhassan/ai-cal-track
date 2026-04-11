import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { completeOnboarding } from '../../lib/auth-store';
import { generateFitnessPlan } from '../../lib/gemini';
import { useOnboarding } from './_layout';

import { CheckmarkBadge01Icon, HourglassIcon } from 'hugeicons-react-native';

const loadingSteps = [
  "Analyzing your profile",
  "Calculating specific calorie needs",
  "Balancing your macronutrients",
  "Structuring optimal water intake",
  "Finalizing your AI fitness plan",
];

export default function GeneratingScreen() {
  const { data } = useOnboarding();
  const { user } = useUser();
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState(0);
  const [isAiFinished, setIsAiFinished] = useState(false);

  useEffect(() => {
    // Check off items one by one like a fake progression bar
    const interval = setInterval(() => {
      setCompletedSteps((prev) => {
        // Stop right before the last item
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let transitionTimeout: ReturnType<typeof setTimeout>;
    let completionTimeout: ReturnType<typeof setTimeout>;

    async function executeGeneration() {
      if (!user?.id) return;
      
      try {
        console.log("Starting AI Generation...");
        const plan = await generateFitnessPlan(data);
        console.log("AI Generation Successful: ", plan);

        await completeOnboarding(user.id, data, plan);
        console.log("Saved to Firestore");
        
        setIsAiFinished(true);
        setCompletedSteps(loadingSteps.length); // Force complete the last step
        
        // Timeout just to make sure they see the final checkmark briefly
        completionTimeout = setTimeout(() => {
            router.replace('/(tabs)' as any);
        }, 1200);
      } catch (error) {
        console.error("AI Generation Failed: ", error);
        // Fallback to complete onboarding anyway so the user isn't stuck
        await completeOnboarding(user.id, data);
        router.replace('/(tabs)' as any);
      }
    }

    // Small timeout to allow UI transition before blocking JS thread
    transitionTimeout = setTimeout(executeGeneration, 500);

    return () => {
      clearTimeout(transitionTimeout);
      clearTimeout(completionTimeout);
    };
  }, [user, data, router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isAiFinished ? (
          <CheckmarkBadge01Icon size={48} color={Colors.primary} />
        ) : (
          <ActivityIndicator size="large" color={Colors.primary} />
        )}
        <Text style={styles.title}>
          {isAiFinished ? "Plan Ready!" : "Generating Plan"}
        </Text>
        <Text style={styles.subtitle}>
          {isAiFinished ? "Your personalized AI plan has been generated." : "This might take a few seconds..."}
        </Text>
      </View>

      <View style={styles.listContainer}>
        {loadingSteps.map((step, index) => {
          const isComplete = index < completedSteps;
          const isCurrent = index === completedSteps;
          const isWaiting = index > completedSteps;

          return (
            <View key={index} style={[styles.stepRow, isCurrent ? styles.stepRowActive : null]}>
              <View style={[styles.iconBox, isComplete ? styles.iconBoxComplete : null]}>
                {isComplete ? (
                    <CheckmarkBadge01Icon size={20} color={Colors.background} />
                ) : isCurrent ? (
                    <HourglassIcon size={20} color={Colors.primary} />
                ) : (
                    <View style={styles.dot} />
                )}
              </View>
              <Text style={[
                styles.stepText, 
                isComplete && styles.stepTextComplete,
                isCurrent && styles.stepTextCurrent,
                isWaiting && styles.stepTextWaiting
              ]}>
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepRowActive: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconBoxComplete: {
    backgroundColor: Colors.primary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepTextComplete: {
    color: Colors.text,
  },
  stepTextCurrent: {
    color: Colors.text,
    fontWeight: '700',
  },
  stepTextWaiting: {
    color: Colors.textMuted,
  }
});
