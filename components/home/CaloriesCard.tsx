
import { useUser } from '@clerk/clerk-expo';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Apple01Icon,
  DropletIcon,
  FireIcon,
  PencilEdit02Icon
} from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useDateStore } from '../../lib/date-store';
import { db } from '../../lib/firebase';
import { GeneratedFitnessPlan } from '../../lib/gemini';
import { DayProgress, fetchUserPlan, formatDateString, updateUserPlan } from '../../lib/tracking';
import SegmentedHalfCircleProgress30 from "../ui/SegmentedHalfCircleProgress30";

export default function CaloriesCard() {
  const { user } = useUser();
  const selectedDate = useDateStore(state => state.selectedDate);

  const [plan, setPlan] = useState<GeneratedFitnessPlan | null>(null);
  const [consumed, setConsumed] = useState<DayProgress>({
    totalCalories: 0,
    totalBurnedCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalWaterMl: 0,
  });

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    calories: '',
    protein: '',
    fat: '',
    carbs: ''
  });

  // 1. Fetch static plan target once
  useEffect(() => {
    if (!user?.id) return;
    fetchUserPlan(user.id).then(data => {
      if (data) {
        setPlan(data as GeneratedFitnessPlan);
        setEditForm({
          calories: (data as GeneratedFitnessPlan).dailyCalories.toString(),
          protein: (data as GeneratedFitnessPlan).macros.proteinGrams.toString(),
          fat: (data as GeneratedFitnessPlan).macros.fatsGrams.toString(),
          carbs: (data as GeneratedFitnessPlan).macros.carbsGrams.toString()
        });
      }
    });
  }, [user?.id]);

  // 2. Real-time listener for the currently selected date
  useEffect(() => {
    if (!user?.id) return;
    const dateStr = formatDateString(selectedDate);
    const logRef = doc(db, 'users', user.id, 'daily_summaries', dateStr);

    const unsubscribe = onSnapshot(logRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConsumed({
          totalCalories: data.totalCalories || 0,
          totalBurnedCalories: data.totalBurnedCalories || 0,
          totalProtein: data.totalProtein || 0,
          totalFat: data.totalFat || 0,
          totalCarbs: data.totalCarbs || 0,
          totalWaterMl: data.totalWaterMl || 0,
        });
      } else {
        // Reset if no logs for this date
        setConsumed({
          totalCalories: 0,
          totalBurnedCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          totalWaterMl: 0,
        });
      }
    });

    return () => unsubscribe();
  }, [user?.id, selectedDate]);

  // Configured default tracking values based on real data
  const currentCalories = consumed.totalCalories;
  const burnedCalories = consumed.totalBurnedCalories;
  
  const baseTargetCalories = plan?.dailyCalories || 2500;
  const effectiveTargetCalories = baseTargetCalories + burnedCalories;
  const remaining = Math.max(0, effectiveTargetCalories - currentCalories);
  
  // Progress from 0 (nothing consumed) to 1 (target reached or exceeded)
  const progressPercent = Math.max(0, Math.min(currentCalories / effectiveTargetCalories, 1)) || 0;

  const proteinLeft = Math.max(0, (plan?.macros?.proteinGrams || 150) - consumed.totalProtein);
  const fatLeft = Math.max(0, (plan?.macros?.fatsGrams || 70) - consumed.totalFat);
  const carbsLeft = Math.max(0, (plan?.macros?.carbsGrams || 250) - consumed.totalCarbs);

  const handleSavePlan = async () => {
    if (!user?.id || !plan) return;
    setIsSaving(true);
    
    const newPlan: GeneratedFitnessPlan = {
      ...plan,
      dailyCalories: parseInt(editForm.calories) || 2500,
      macros: {
        proteinGrams: parseInt(editForm.protein) || 150,
        fatsGrams: parseInt(editForm.fat) || 70,
        carbsGrams: parseInt(editForm.carbs) || 250,
      }
    };
    
    const success = await updateUserPlan(user.id, newPlan);
    if (success) {
      setPlan(newPlan); // Optmistic local update
      setIsEditModalVisible(false);
    } else {
      alert("Failed to update goals.");
    }
    
    setIsSaving(false);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calories</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={() => setIsEditModalVisible(true)}>
          <PencilEdit02Icon size={20} color={Colors.primary} variant="stroke" />
        </TouchableOpacity>
      </View>

      {/* Custom Request: SegmentedHalfCircleProgress30 inside chartContainer */}
      <View style={styles.chartContainer}>
        <SegmentedHalfCircleProgress30
          progress={progressPercent}
          size={300}
          strokeWidth={50}
          value={remaining}
          label="Remaining"
          segments={12}
          gapAngle={8}
        />
      </View>

      {/* Macro Boxes */}
      <View style={styles.macrosContainer}>
        <View style={styles.macroBox}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <FireIcon size={20} color="#EF4444" variant="stroke" />
          </View>
          <View style={styles.macroTextContainer}>
            <Text style={styles.macroValue}>{proteinLeft}g</Text>
            <Text style={styles.macroTitle}>Protein Left</Text>
          </View>
        </View>

        <View style={styles.macroBox}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
            <DropletIcon size={20} color="#EAB308" variant="stroke" />
          </View>
          <View style={styles.macroTextContainer}>
            <Text style={styles.macroValue}>{fatLeft}g</Text>
            <Text style={styles.macroTitle}>Fat Left</Text>
          </View>
        </View>

        <View style={styles.macroBox}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Apple01Icon size={20} color="#3B82F6" variant="stroke" />
          </View>
          <View style={styles.macroTextContainer}>
            <Text style={styles.macroValue}>{carbsLeft}g</Text>
            <Text style={styles.macroTitle}>Carbs Left</Text>
          </View>
        </View>
      </View>

      {/* Edit Goals Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Daily Targets</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories Target</Text>
              <TextInput 
                style={styles.modalInput} 
                keyboardType="numeric"
                value={editForm.calories}
                onChangeText={(val: string) => setEditForm(f => ({...f, calories: val}))}
              />
            </View>

            <View style={styles.modalRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput 
                  style={styles.modalInput} 
                  keyboardType="numeric"
                  value={editForm.protein}
                  onChangeText={(val: string) => setEditForm(f => ({...f, protein: val}))}
                />
              </View>
              <View style={{width: 12}} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput 
                  style={styles.modalInput} 
                  keyboardType="numeric"
                  value={editForm.fat}
                  onChangeText={(val: string) => setEditForm(f => ({...f, fat: val}))}
                />
              </View>
              <View style={{width: 12}} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput 
                  style={styles.modalInput} 
                  keyboardType="numeric"
                  value={editForm.carbs}
                  onChangeText={(val: string) => setEditForm(f => ({...f, carbs: val}))}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveBtn}
                onPress={handleSavePlan}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Goals</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    marginVertical: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3, // For Android professional soft shadow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Crisp spacing
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    // Provide responsive scaling just in case the hardcoded 'size=300' exceeds micro-screens
    transform: [{ scale: 0.95 }], 
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroBox: {
    flex: 1,
    height: 106, // Taller size to accommodate vertical grid stacking
    backgroundColor: 'rgba(41, 143, 80, 0.12)', // Visibly brighter light green
    borderRadius: 20,
    flexDirection: 'column', // Vertically stack the icon above the text
    justifyContent: 'center',
    alignItems: 'center', // Keep them perfectly centered
    padding: 10,
    borderWidth: 1.5, // Stronger green grid outlines
    borderColor: 'rgba(41, 143, 80, 0.25)', 
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Gap beneath the icon before the text
  },
  macroTextContainer: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  macroTitle: {
    fontSize: 11, // slightly smaller so perfectly fits
    fontWeight: '600',
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  modalRow: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalSaveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  }
});

