import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ArrowLeft01Icon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useDateStore } from '../../lib/date-store';
import { addDailyLog, formatDateString } from '../../lib/tracking';

export default function AddLogScreen() {
  const { user } = useUser();
  const router = useRouter();
  const selectedDate = useDateStore(state => state.selectedDate);
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    waterMl: '',
  });

  const handleLogSubmit = async () => {
    if (!user?.id) return;
    
    const cal = parseInt(form.calories) || 0;
    const pro = parseInt(form.protein) || 0;
    const fat = parseInt(form.fat) || 0;
    const car = parseInt(form.carbs) || 0;
    const water = parseInt(form.waterMl) || 0;

    if (cal === 0 && pro === 0 && fat === 0 && car === 0 && water === 0) {
      alert("Please enter at least one value.");
      return;
    }

    setLoading(true);
    await addDailyLog(user.id, selectedDate, {
      calories: cal,
      protein: pro,
      fat: fat,
      carbs: car,
      waterMl: water,
    });
    setLoading(false);
    
    // Auto-return to home
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft01Icon size={24} color={Colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Log</Text>
        <View style={{width: 40}} /> 
      </View>

      <Text style={styles.dateLabel}>Logging for: {formatDateString(selectedDate)}</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Calories (kcal)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500"
            keyboardType="numeric"
            value={form.calories}
            onChangeText={(val) => setForm(f => ({...f, calories: val}))}
            placeholderTextColor={Colors.iconMuted}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 30"
              keyboardType="numeric"
              value={form.protein}
              onChangeText={(val) => setForm(f => ({...f, protein: val}))}
              placeholderTextColor={Colors.iconMuted}
            />
          </View>
          <View style={{width: 16}} />
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 15"
              keyboardType="numeric"
              value={form.fat}
              onChangeText={(val) => setForm(f => ({...f, fat: val}))}
              placeholderTextColor={Colors.iconMuted}
            />
          </View>
          <View style={{width: 16}} />
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 45"
              keyboardType="numeric"
              value={form.carbs}
              onChangeText={(val) => setForm(f => ({...f, carbs: val}))}
              placeholderTextColor={Colors.iconMuted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Water (ml)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 250 (1 glass)"
            keyboardType="numeric"
            value={form.waterMl}
            onChangeText={(val) => setForm(f => ({...f, waterMl: val}))}
            placeholderTextColor={Colors.iconMuted}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleLogSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Save Log</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  dateLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  }
});
