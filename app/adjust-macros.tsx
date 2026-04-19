import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Vitality } from '../constants/Colors';
import { updateLogMacros, formatDateString } from '../lib/tracking';
import * as Haptics from 'expo-haptics';
import { useUser } from '@clerk/clerk-expo';

export default function AdjustMacrosScreen() {
  const router = useRouter();
  const { user } = useUser();
  const params = useLocalSearchParams();
  
  // Existing data
  const logId = params.id as string;
  const initialType = params.burnedCalories && Number(params.burnedCalories) > 0 ? 'Exercise' : 'Food';
  
  const [type, setType] = useState<'Food' | 'Exercise'>(initialType as any);
  const [calories, setCalories] = useState(params.calories?.toString() || '0');
  const [carbs, setCarbs] = useState(params.carbs?.toString() || '0');
  const [protein, setProtein] = useState(params.protein?.toString() || '0');
  const [fat, setFat] = useState(params.fat?.toString() || '0');
  
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleSubmit = async () => {
    if (!user || !logId) return;
    
    setLoading(true);
    const oldData = {
      calories: Number(params.calories || 0),
      protein: Number(params.protein || 0),
      fat: Number(params.fat || 0),
      carbs: Number(params.carbs || 0),
      burnedCalories: Number(params.burnedCalories || 0)
    };

    const newData = type === 'Food' ? {
      calories: Number(calories),
      protein: Number(protein),
      fat: Number(fat),
      carbs: Number(carbs),
      burnedCalories: 0
    } : {
      calories: 0,
      burnedCalories: Number(calories),
      protein: 0,
      fat: 0,
      carbs: 0
    };

    const success = await updateLogMacros(user.id, new Date(), logId, oldData, newData);
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else {
      Alert.alert("Error", "Failed to update entry. Please try again.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Vitality.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adjust Calories & Macros</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Entry Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Entry type</Text>
            <TouchableOpacity 
              style={styles.pickerTrigger} 
              onPress={() => setShowTypePicker(!showTypePicker)}
            >
              <Text style={styles.pickerValue}>{type}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={Vitality.textMuted} />
            </TouchableOpacity>

            {showTypePicker && (
              <View style={styles.pickerMenu}>
                <TouchableOpacity 
                  style={styles.pickerOption} 
                  onPress={() => { setType('Food'); setShowTypePicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, type === 'Food' && { color: Vitality.primary }]}>Food</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.pickerOption} 
                  onPress={() => { setType('Exercise'); setShowTypePicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, type === 'Exercise' && { color: Vitality.primary }]}>Exercise</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Calories (Always shown) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.textInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Vitality.textMuted}
            />
          </View>

          {/* Conditional Macro Fields */}
          {type === 'Food' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Carbohydrates</Text>
                <TextInput
                  style={styles.textInput}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Vitality.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Protein</Text>
                <TextInput
                  style={styles.textInput}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Vitality.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fat</Text>
                <TextInput
                  style={styles.textInput}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Vitality.textMuted}
                />
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Vitality.background} />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Vitality.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Vitality.text,
  },
  scrollContent: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: Vitality.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerValue: {
    fontSize: 18,
    color: Vitality.text,
    fontWeight: '600',
  },
  pickerMenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pickerOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  pickerOptionText: {
    color: Vitality.text,
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    fontSize: 20,
    color: Vitality.text,
    fontWeight: '600',
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    backgroundColor: '#EEF2FF', // Soft white/blue as per image
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: 140, // Centered and smaller as per image
  },
  submitButtonText: {
    color: '#312E81', // Dark blue as per image
    fontSize: 18,
    fontWeight: '700',
  },
});
