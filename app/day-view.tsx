import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Vitality } from '../constants/Colors';
import { GlassCard } from '../components/stitch/GlassCard';
import { useDateStore } from '../lib/date-store';
import { fetchDailyProgress, DayProgress } from '../lib/tracking';

const NutrientRow = ({ label, value, isChild = false, isBold = false }: { label: string; value: string; isChild?: boolean; isBold?: boolean }) => (
  <View style={[styles.nutrientRow, isChild && styles.childRow]}>
    <Text style={[styles.nutrientLabel, isBold && styles.boldText]}>{label}</Text>
    <Text style={[styles.nutrientValue, isBold && styles.boldText]}>{value}</Text>
  </View>
);

const SectionDivider = () => <View style={styles.sectionDivider} />;

export default function DayView() {
  const router = useRouter();
  const { user } = useUser();
  const selectedDate = useDateStore((state) => state.selectedDate);
  const [progress, setProgress] = useState<DayProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      setLoading(true);
      const data = await fetchDailyProgress(user.id, selectedDate);
      setProgress(data);
      setLoading(false);
    };
    
    loadData();
  }, [user?.id, selectedDate]);

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Vitality.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Day View</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.dateLabel}>{formattedDate}</Text>

          {loading ? (
            <ActivityIndicator size="large" color={Vitality.primary} style={{ marginTop: 40 }} />
          ) : (
            <GlassCard style={styles.factsCard}>
              <Text style={styles.cardTitle}>Nutrition Facts</Text>
              
              <NutrientRow label="Calories" value={`${Math.round(progress?.totalCalories || 0)}`} isBold />
              <SectionDivider />
              
              <NutrientRow label="Total Carbohydrates" value={`${Math.round(progress?.totalCarbs || 0)}g`} isBold />
              <NutrientRow label="Dietary Fiber" value={`${Math.round(progress?.totalFiber || 0)}g`} isChild />
              <NutrientRow label="Sugar" value={`${Math.round(progress?.totalSugar || 0)}g`} isChild />
              <NutrientRow label="Added Sugar" value={`${Math.round(progress?.totalAddedSugar || 0)}g`} isChild />
              <NutrientRow label="Sugar Alcohols" value={`${Math.round(progress?.totalSugarAlcohols || 0)}g`} isChild />
              <NutrientRow label="Net Carbs" value={`${Math.round((progress?.totalCarbs || 0) - (progress?.totalFiber || 0))}g`} isChild />
              
              <SectionDivider />
              
              <NutrientRow label="Protein" value={`${Math.round(progress?.totalProtein || 0)}g`} isBold />
              
              <SectionDivider />

              <NutrientRow label="Total Fat" value={`${Math.round(progress?.totalFat || 0)}g`} isBold />
              <NutrientRow label="Saturated Fat" value={`${Math.round(progress?.totalSaturatedFat || 0)}g`} isChild />
              <NutrientRow label="Trans Fat" value={`${Math.round(progress?.totalTransFat || 0)}g`} isChild />
              <NutrientRow label="Polyunsaturated Fat" value={`${Math.round(progress?.totalPolyunsaturatedFat || 0)}g`} isChild />
              <NutrientRow label="Monounsaturated Fat" value={`${Math.round(progress?.totalMonounsaturatedFat || 0)}g`} isChild />
              
              <SectionDivider />

              <NutrientRow label="Cholesterol" value={`${Math.round(progress?.totalCholesterol || 0)}mg`} />
              <NutrientRow label="Sodium" value={`${Math.round(progress?.totalSodium || 0)}mg`} />
              <NutrientRow label="Potassium" value={`${Math.round(progress?.totalPotassium || 0)}mg`} />
              
              <SectionDivider />
              
              <NutrientRow label="Calcium" value={`${Math.round(progress?.totalCalcium || 0)}mg`} />
              <NutrientRow label="Iron" value={`${Math.round(progress?.totalIron || 0)}mg`} />
              <NutrientRow label="Vitamin A" value={`${Math.round(progress?.totalVitaminA || 0)}IU`} />
              <NutrientRow label="Vitamin C" value={`${Math.round(progress?.totalVitaminC || 0)}mg`} />
              <NutrientRow label="Vitamin D" value={`${Math.round(progress?.totalVitaminD || 0)}IU`} />

              <View style={styles.footerNote}>
                <Text style={styles.footerText}>
                  * Nutritional values are estimated by AI based on your logs and typically associated food profiles.
                </Text>
              </View>
            </GlassCard>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Vitality.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Vitality.text,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  dateLabel: {
    fontSize: 16,
    color: Vitality.textMuted,
    marginBottom: 24,
  },
  factsCard: {
    borderRadius: 24,
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Vitality.text,
    marginBottom: 24,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  childRow: {
    paddingLeft: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  nutrientLabel: {
    fontSize: 14,
    color: Vitality.text,
  },
  nutrientValue: {
    fontSize: 14,
    color: Vitality.text,
  },
  boldText: {
    fontWeight: '800',
    fontSize: 16,
  },
  sectionDivider: {
    height: 4,
    backgroundColor: Vitality.text,
    marginVertical: 4,
    opacity: 0.1,
  },
  footerNote: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(89, 222, 155, 0.05)',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: Vitality.textMuted,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
