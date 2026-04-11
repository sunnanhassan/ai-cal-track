import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, ClipboardIcon, Image01Icon } from 'hugeicons-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useFoodStore } from '../../lib/food-store';
import { analyzeFoodImage, FoodNutritionData } from '../../lib/gemini';

export default function LogFoodScan() {
  const router = useRouter();
  const { scannedImageUri, scannedImageBase64, setSelectedFood, setScannedImageUri, setScannedImageBase64 } = useFoodStore();

  const [aiResult, setAiResult] = useState<FoodNutritionData | null>(null);

  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function processImage() {
      if (!scannedImageBase64) {
        // Fallback or error state
        setStep1Done(true);
        setStep2Done(true);
        setStep3Done(true);
        return;
      }

      try {
        setStep1Done(true); // "Analyzing food..." (Upload complete)

        const result = await analyzeFoodImage(scannedImageBase64);
        
        if (mounted) {
          setAiResult(result);
          setStep2Done(true); // "Getting Nutrition data..." (AI returned data)
          
          // Add a tiny UX delay for the final step to simulate "Get final result"
          setTimeout(() => {
            if (mounted) setStep3Done(true);
          }, 800);
        }
      } catch (error) {
        console.error("AI Analysis Failed", error);
        if (mounted) {
          // If it fails, let's gracefully unlock the continue button but it might have 0s
          setStep2Done(true);
          setStep3Done(true);
        }
      }
    }

    processImage();

    return () => {
      mounted = false;
    };
  }, [scannedImageBase64]);

  const handleContinue = () => {
    // Generate the payload mimicking the successful API result or fallback
    setSelectedFood({
      foodId: Date.now().toString(),
      foodName: aiResult?.foodName || 'Unknown Food',
      brandName: 'AI Vision Scan',
      servingSize: aiResult?.servingSize || '1 serving',
      calories: aiResult?.calories || '0',
      protein: aiResult?.protein || '0',
      fat: aiResult?.fat || '0',
      carbs: aiResult?.carbs || '0'
    });
    // Jump straight to the Macro Editor
    router.replace('/(tabs)/log-food-details');
    // Clean up memory
    setScannedImageUri(null);
    setScannedImageBase64(null);
  };

  const renderStep = (title: string, isStarted: boolean, isDone: boolean) => {
    return (
      <View style={[styles.stepRow, !isStarted && { opacity: 0.3 }]}>
        <View style={styles.stepIconBox}>
          {isDone ? (
            <View style={[styles.circleCheck, { backgroundColor: '#22C55E' }]}>
               <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>✓</Text>
            </View>
          ) : isStarted ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <View style={[styles.circleCheck, { backgroundColor: Colors.border }]} />
          )}
        </View>
        <Text style={[styles.stepText, isDone && { color: Colors.text, fontWeight: '700' }]}>
          {title}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            setScannedImageUri(null);
            setScannedImageBase64(null);
            router.back();
          }} 
          style={styles.backButton}
        >
          <ArrowLeft02Icon size={20} color={Colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyzing Food</Text>
      </View>

      <View style={styles.content}>
        {/* Huge Square Image Box */}
        <View style={styles.imageContainer}>
          {scannedImageUri ? (
            <Image 
              source={{ uri: scannedImageUri }} 
              style={styles.imageSquare} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Image01Icon size={48} color={Colors.iconMuted} variant="stroke" />
            </View>
          )}
        </View>

        {/* Googletator Pipeline Tracker */}
        <View style={styles.trackerContainer}>
          {renderStep("Analyzing food...", true, step1Done)}
          {renderStep("Getting Nutrition data...", step1Done, step2Done)}
          {renderStep("Get final result...", step2Done, step3Done)}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, !step3Done && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={!step3Done}
        >
          <ClipboardIcon size={20} color={step3Done ? Colors.background : Colors.textMuted} variant="stroke" />
          <Text style={[styles.continueButtonText, !step3Done && { color: Colors.textMuted }]}>
            {step3Done ? "Continue" : "Scanning..."}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  imageContainer: {
    width: 280,
    height: 280,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 40,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  imageSquare: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconBox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  circleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  continueButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  }
});
