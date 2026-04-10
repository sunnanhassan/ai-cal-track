import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, FireIcon, SteakIcon, DropletIcon, Pizza01Icon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useFoodStore } from '../../lib/food-store';
import { addDailyLog } from '../../lib/tracking';
import { useAuth } from '@clerk/clerk-expo';
import { useDateStore } from '../../lib/date-store';

export default function LogFoodDetails() {
  const router = useRouter();
  const { userId } = useAuth();
  const { selectedDate } = useDateStore();
  const { selectedFood, setSelectedFood } = useFoodStore();

  // Baseline numeric values
  const baseCal = parseFloat(selectedFood?.calories || '0');
  const basePro = parseFloat(selectedFood?.protein || '0');
  const baseFat = parseFloat(selectedFood?.fat || '0');
  const baseCarb = parseFloat(selectedFood?.carbs || '0');

  // State for editable inputs (initialized safely before any early returns)
  const [quantity, setQuantity] = useState('1');
  const [calories, setCalories] = useState(selectedFood?.calories || '0');
  const [protein, setProtein] = useState(selectedFood?.protein || '0');
  const [fat, setFat] = useState(selectedFood?.fat || '0');
  const [carbs, setCarbs] = useState(selectedFood?.carbs || '0');
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic multiplication handler
  const handleQuantityChange = (text: string) => {
    // Allows decimal points
    const formattedText = text.replace(/[^0-9.]/g, '');
    setQuantity(formattedText);

    const multiplier = parseFloat(formattedText);
    if (!isNaN(multiplier) && multiplier > 0) {
      // Scale everything and remove trailing zeroes decimals nicely
      setCalories(parseFloat((baseCal * multiplier).toFixed(1)).toString());
      setProtein(parseFloat((basePro * multiplier).toFixed(1)).toString());
      setFat(parseFloat((baseFat * multiplier).toFixed(1)).toString());
      setCarbs(parseFloat((baseCarb * multiplier).toFixed(1)).toString());
    } else if (text === '') {
      setCalories('0');
      setProtein('0');
      setFat('0');
      setCarbs('0');
    }
  };

  // If no food selected, fallback
  if (!selectedFood) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No food selected.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSaveData = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to save entries.');
      return;
    }

    setIsSaving(true);
    
    const numericCalories = parseFloat(calories) || 0;
    const numericProtein = parseFloat(protein) || 0;
    const numericFat = parseFloat(fat) || 0;
    const numericCarbs = parseFloat(carbs) || 0;

    const logPayload = {
      name: selectedFood.brandName ? `${selectedFood.brandName} - ${selectedFood.foodName}` : selectedFood.foodName,
      calories: numericCalories,
      protein: numericProtein,
      fat: numericFat,
      carbs: numericCarbs,
      waterMl: 0,
      workoutType: "Food Logging",
      intensity: `${quantity} x ${selectedFood.servingSize}` // Tracks multiplier
    };

    const success = await addDailyLog(userId, selectedDate, logPayload);

    setIsSaving(false);

    if (success) {
      // Clear store to be tidy
      setSelectedFood(null);
      router.push('/(tabs)');
    } else {
      Alert.alert('Save Failed', 'We could not save your food element to Firebase.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={20} color={Colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Food</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.foodName}>{selectedFood.foodName}</Text>
          {selectedFood.brandName ? (
            <Text style={styles.brandName}>{selectedFood.brandName}</Text>
          ) : null}
        </View>

        {/* Serving Configurator */}
        <View style={styles.servingContainer}>
           <View style={[styles.inputGroup, { flex: 0.35, marginRight: 12 }]}>
             <Text style={styles.inputLabel}>SERVINGS</Text>
             <View style={styles.inputWrapper}>
                <TextInput 
                  style={[styles.textInputFull, { textAlign: 'center' }]}
                  value={quantity}
                  onChangeText={handleQuantityChange}
                  keyboardType="decimal-pad"
                />
             </View>
           </View>
           
           <View style={[styles.inputGroup, { flex: 0.65 }]}>
             <Text style={styles.inputLabel}>SERVING SIZE</Text>
             <View style={[styles.inputWrapper, { opacity: 0.7 }]}>
                <Text style={[styles.textInputFull, { lineHeight: 54, color: Colors.textMuted }]} numberOfLines={1}>
                   {selectedFood.servingSize}
                </Text>
             </View>
           </View>
        </View>

        {/* Calories Editor */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
             <View style={[styles.inlineIconBox, { backgroundColor: '#FEE2E2' }]}>
                <FireIcon size={16} color="#DC2626" variant="stroke" />
             </View>
             <Text style={styles.calorieLabelText}>Calories</Text>
          </View>

          <View style={styles.calorieBody}>
            <TextInput 
              style={styles.calorieNumberInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>
        </View>

        {/* Macros Editor (Grid 3 Columns) */}
        <View style={styles.macroGrid}>
          
          {/* Protein */}
          <View style={styles.macroCard}>
             <View style={[styles.macroIconBox, { backgroundColor: '#E0F2FE' }]}>
                <SteakIcon size={20} color="#0EA5E9" variant="stroke" />
             </View>
             <Text style={styles.macroLabel}>Protein</Text>
             <View style={styles.macroValContainer}>
                <TextInput 
                  style={styles.macroInput}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                />
                <Text style={styles.macroUnit}>g</Text>
             </View>
          </View>

          {/* Fat */}
          <View style={styles.macroCard}>
             <View style={[styles.macroIconBox, { backgroundColor: '#FFEDD5' }]}>
                <DropletIcon size={20} color="#F97316" variant="stroke" />
             </View>
             <Text style={styles.macroLabel}>Fats</Text>
             <View style={styles.macroValContainer}>
                <TextInput 
                  style={styles.macroInput}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                />
                <Text style={styles.macroUnit}>g</Text>
             </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroCard}>
             <View style={[styles.macroIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Pizza01Icon size={20} color="#22C55E" variant="stroke" />
             </View>
             <Text style={styles.macroLabel}>Carbs</Text>
             <View style={styles.macroValContainer}>
                <TextInput 
                  style={styles.macroInput}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                />
                <Text style={styles.macroUnit}>g</Text>
             </View>
          </View>

        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
          onPress={handleSaveData}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Log to Diary"}</Text>
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
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  titleBlock: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  foodName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 32,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary, // Uses primary color instead of hardcoded green
  },
  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  textInputFull: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    height: '100%',
  },
  calorieCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inlineIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  calorieLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  calorieBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  calorieNumberInput: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
    padding: 0,
    margin: 0,
    minWidth: 60,
    textAlign: 'center',
  },
  calorieUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 8,
    marginBottom: 8, // align nicely with the big text
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  macroIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  macroValContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  macroInput: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    padding: 0,
    margin: 0,
    minWidth: 20,
    textAlign: 'center',
  },
  macroUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  }
});
