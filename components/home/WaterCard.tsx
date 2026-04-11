import { useUser } from '@clerk/clerk-expo';
import { doc, onSnapshot } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PencilEdit02Icon } from 'hugeicons-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useDateStore } from '../../lib/date-store';
import { db } from '../../lib/firebase';
import { GeneratedFitnessPlan } from '../../lib/gemini';
import { DayProgress, fetchUserPlan, formatDateString, updateUserPlan } from '../../lib/tracking';

const MAX_GLASSES = 9;

export default function WaterCard() {
  const { user } = useUser();
  const selectedDate = useDateStore(state => state.selectedDate);

  const [plan, setPlan] = useState<GeneratedFitnessPlan | null>(null);
  const [consumed, setConsumed] = useState<DayProgress>({
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalWaterMl: 0,
    totalBurnedCalories: 0,
  });

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    waterLiters: '',
  });

  useEffect(() => {
    if (!user?.id) return;
    fetchUserPlan(user.id).then(data => {
      if (data) {
        setPlan(data as GeneratedFitnessPlan);
        setEditForm({
          waterLiters: (data as GeneratedFitnessPlan).waterIntakeLiters?.toString() || '2.5'
        });
      }
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const dateStr = formatDateString(selectedDate);
    const logRef = doc(db, 'users', user.id, 'daily_summaries', dateStr);

    const unsubscribe = onSnapshot(logRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConsumed({
          totalCalories: data.totalCalories || 0,
          totalProtein: data.totalProtein || 0,
          totalFat: data.totalFat || 0,
          totalCarbs: data.totalCarbs || 0,
          totalWaterMl: data.totalWaterMl || 0,
          totalBurnedCalories: data.totalBurnedCalories || 0,
        });
      } else {
        setConsumed({
          totalCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          totalWaterMl: 0,
          totalBurnedCalories: 0,
        });
      }
    });

    return () => unsubscribe();
  }, [user?.id, selectedDate]);

  const handleSavePlan = async () => {
    if (!user?.id || !plan) return;
    setIsSaving(true);
    
    // We parse local float (e.g., 2.5 Liters)
    const newLiters = parseFloat(editForm.waterLiters) || 2.5;

    const newPlan: GeneratedFitnessPlan = {
      ...plan,
      waterIntakeLiters: newLiters
    };
    
    const success = await updateUserPlan(user.id, newPlan);
    if (success) {
      setPlan(newPlan);
      setIsEditModalVisible(false);
    } else {
      alert("Failed to update water goal.");
    }
    
    setIsSaving(false);
  };

  // Calculations
  const targetMl = (plan?.waterIntakeLiters || 2.5) * 1000;
  const consumedMl = consumed.totalWaterMl;
  
  // Dynamically calculate how much water each glass represents to fit exactly MAX_GLASSES
  const mlPerGlass = targetMl / MAX_GLASSES;
  
  const totalGlasses = MAX_GLASSES; 
  const fullGlasses = Math.floor(consumedMl / mlPerGlass);
  const remainderMl = consumedMl % mlPerGlass;
  const isHalfGlass = remainderMl >= (mlPerGlass / 2);
  
  // Render function for exactly 1 row of up to 9 glasses
  const renderGlasses = () => {
    const glasses = [];
    
    for (let i = 0; i < totalGlasses; i++) {
        const isFull = i < fullGlasses;
        const isHalf = i === fullGlasses && isHalfGlass;
        
        const scaleStyle = (isFull || isHalf) ? { transform: [{ scale: 1.25 }] } : { transform: [{ scale: 0.95 }] };

        if (isFull) {
            glasses.push(
                <View key={i} style={[styles.glassWrapper, scaleStyle]}>
                    <MaterialCommunityIcons name="cup" size={28} color="#3B82F6" />
                </View>
            );
        } else if (isHalf) {
            glasses.push(
                <View key={i} style={[styles.glassWrapper, scaleStyle]}>
                   <View style={styles.glassIconLayer}>
                      <MaterialCommunityIcons name="cup-outline" size={28} color="#60A5FA" />
                   </View>
                   <View style={styles.halfMask}>
                     <View style={styles.halfIconLayer}>
                        <MaterialCommunityIcons name="cup" size={28} color="#3B82F6" />
                     </View>
                   </View>
                </View>
            );
        } else {
            glasses.push(
                <View key={i} style={[styles.glassWrapper, scaleStyle]}>
                    <MaterialCommunityIcons name="cup-outline" size={28} color="#93C5FD" style={{ opacity: 0.8 }} />
                </View>
            );
        }
    }
    return glasses;
  };

  const glassesLeft = Math.max(0, totalGlasses - fullGlasses - (isHalfGlass ? 0.5 : 0));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Water Intake</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={() => setIsEditModalVisible(true)}>
          <PencilEdit02Icon size={20} color={Colors.primary} variant="stroke" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
         {consumedMl} ml / {targetMl} ml
      </Text>

      <View style={styles.glassesContainer}>
        {renderGlasses()}
      </View>
      
      <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            <Text style={{fontWeight: '800', color: Colors.text}}>{glassesLeft}</Text> glasses left to reach daily goal
          </Text>
      </View>

      {/* Edit Goal Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Water Goal</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Target (Liters)</Text>
              <TextInput 
                style={styles.modalInput} 
                keyboardType="numeric"
                value={editForm.waterLiters}
                onChangeText={(val) => setEditForm({ waterLiters: val })}
                placeholder="e.g 2.5"
              />
              <Text style={styles.inputHint}>We recommend at least 2.5 Liters daily.</Text>
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
                  <Text style={styles.modalSaveText}>Save Goal</Text>
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
    marginBottom: 24, // spacing after last card
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 20,
  },
  glassesContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  glassWrapper: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 28, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  // Modal Styles exactly as CaloriesCard to ensure UX consistency
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
  inputHint: {
    fontSize: 12,
    color: Colors.textMuted,
    paddingTop: 8,
    marginLeft: 4,
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
