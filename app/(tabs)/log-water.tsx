import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, PlusSignIcon, MinusSignIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useDateStore } from '../../lib/date-store';
import { addDailyLog } from '../../lib/tracking';

const GLASS_ML = 250;
const HALF_GLASS_ML = 125;
const MAX_ML = 1000; // Visual cap to 4 glasses

export default function LogWater() {
  const router = useRouter();
  const { user } = useUser();
  const selectedDate = useDateStore(state => state.selectedDate);
  const [waterMl, setWaterMl] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute glasses state
  const totalGlassesAllowed = 4;
  const fullGlasses = Math.floor(waterMl / GLASS_ML);
  const hasHalfGlass = (waterMl % GLASS_ML) >= HALF_GLASS_ML;
  const emptyGlasses = waterMl === 0 ? 1 : 0;

  const handleIncrement = () => {
    if (waterMl < MAX_ML) {
      setWaterMl(prev => prev + HALF_GLASS_ML);
    }
  };

  const handleDecrement = () => {
    if (waterMl > 0) {
      setWaterMl(prev => prev - HALF_GLASS_ML);
    }
  };

  const handleLog = async () => {
    if (!user || waterMl <= 0) return;
    
    setIsSubmitting(true);
    try {
      const success = await addDailyLog(user.id, selectedDate, {
        name: 'Water Intake',
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        waterMl: waterMl
      });

      if (success) {
        router.replace('/(tabs)');
      } else {
        alert("Failed to save water log. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred preserving your water log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={24} color={Colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Water Intake</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.glassesContainer}>
          {Array.from({ length: fullGlasses }).map((_, i) => (
            <View key={`full-${i}`} style={[styles.glassWrapper, { transform: [{ scale: 1.2 }] }]}>
              <MaterialCommunityIcons name="cup" size={64} color="#3B82F6" />
            </View>
          ))}

          {hasHalfGlass && fullGlasses < totalGlassesAllowed && (
            <View key="half" style={[styles.glassWrapper, { transform: [{ scale: 1.2 }] }]}>
               {/* Background Outline */}
               <View style={styles.glassIconLayer}>
                  <MaterialCommunityIcons name="cup-outline" size={64} color="#3B82F6" />
               </View>
               
               {/* Filled Bottom Half */}
               <View style={styles.halfMask}>
                 <View style={styles.halfIconLayer}>
                    <MaterialCommunityIcons name="cup" size={64} color="#3B82F6" />
                 </View>
               </View>
            </View>
          )}

          {Array.from({ length: emptyGlasses }).map((_, i) => (
            <View key={`empty-${i}`} style={[styles.glassWrapper, { transform: [{ scale: 0.9 }] }]}>
              <MaterialCommunityIcons name="cup-outline" size={64} color={Colors.iconMuted} />
            </View>
          ))}
        </View>

        {/* Info & Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity 
            style={[styles.controlBtn, waterMl <= 0 && styles.controlBtnDisabled]} 
            onPress={handleDecrement}
            disabled={waterMl <= 0}
          >
            <MinusSignIcon size={28} color={waterMl <= 0 ? Colors.iconMuted : Colors.text} variant="stroke" />
          </TouchableOpacity>

          <View style={styles.amountDisplayContainer}>
            <Text style={styles.amountValue}>{waterMl}</Text>
            <Text style={styles.amountUnit}>ml</Text>
          </View>

          <TouchableOpacity 
            style={[styles.controlBtn, waterMl >= MAX_ML && styles.controlBtnDisabled]} 
            onPress={handleIncrement}
            disabled={waterMl >= MAX_ML}
          >
            <PlusSignIcon size={28} color={waterMl >= MAX_ML ? Colors.iconMuted : Colors.text} variant="stroke" />
          </TouchableOpacity>
        </View>
        <Text style={styles.instructionText}>
          Each full glass is 250ml. Adjust appropriately!
        </Text>

      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.logButton, 
            (isSubmitting || waterMl === 0) && styles.logButtonDisabled
          ]} 
          activeOpacity={0.8}
          onPress={handleLog}
          disabled={isSubmitting || waterMl === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.logButtonText}>Log Water</Text>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  glassWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glassIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    overflow: 'hidden',
  },
  halfIconLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64, // Must perfectly match glassWrapper to align inner icon!
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    opacity: 0.5,
  },
  amountDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
  },
  amountUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 4,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  logButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonDisabled: {
    opacity: 0.5,
  },
  logButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  }
});
