import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollValue, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Vitality } from '../constants/Colors';
import { GlassCard } from '../components/stitch/GlassCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDateStore } from '../lib/date-store';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { DailyLog, formatDateString } from '../lib/tracking';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';

const SectionDivider = () => <View style={styles.divider} />;
const NutrientRow = ({ label, value, isBold = false, isChild = false }: { label: string; value: string; isBold?: boolean; isChild?: boolean }) => (
  <View style={[styles.nutrientRow, isChild && styles.childRow]}>
    <Text style={[styles.nutrientLabel, isBold && styles.boldLabel]}>{label}</Text>
    <Text style={[styles.nutrientValue, isBold && styles.boldLabel]}>{value}</Text>
  </View>
);

const MacroBlock = ({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) => (
  <View style={styles.macroBlock}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}</Text>
    <View style={styles.macroBarContainer}>
      <View style={[styles.macroBarFill, { width: `${Math.min(100, percent)}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.macroPercent}>{Math.round(percent)}%</Text>
  </View>
);

export default function FoodDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedDate } = useDateStore();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogDetail() {
      if (!user?.id || !logId) return;
      
      try {
        setLoading(true);
        const dateStr = formatDateString(selectedDate);
        const logRef = doc(db, 'users', user.id, 'daily_summaries', dateStr, 'entries', logId);
        const snap = await getDoc(logRef);
        
        if (snap.exists()) {
          setLog({ id: snap.id, ...snap.data() } as DailyLog);
        } else {
          console.log("No such document at:", logRef.path);
        }
      } catch (error) {
        console.error('Error fetching log detail:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogDetail();
  }, [logId, selectedDate, user?.id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Vitality.primary} />
      </View>
    );
  }

  if (!log) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Log entry not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Vitality.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry Insights</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={22} color={Vitality.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.foodName}>{log.name}</Text>
            <Text style={styles.timeTag}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={Vitality.textMuted} /> {new Date(log.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            <View style={styles.macroRow}>
              <MacroBlock label="Calories" value={`${Math.round(log.calories)}`} percent={(log.calories / 3000) * 100} color={Vitality.primary} />
              <MacroBlock label="Carbs" value={`${Math.round(log.carbs)}g`} percent={(log.carbs / 300) * 100} color="#f0b429" />
              <MacroBlock label="Protein" value={`${Math.round(log.protein)}g`} percent={(log.protein / 150) * 100} color="#667eea" />
              <MacroBlock label="Fat" value={`${Math.round(log.fat)}g`} percent={(log.fat / 80) * 100} color="#e4e1e9" />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Health Analysis Card */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <GlassCard style={styles.analysisCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="sparkles" size={18} color={Vitality.primary} />
              <Text style={styles.cardTitle}>Health Analysis</Text>
            </View>
            <Text style={styles.analysisText}>
              {log.healthAnalysis || "This specific meal analysis was not generated for this entry. New entries will include custom insights tailored to your meal quantity and quality."}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Nutrition Facts Card */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <GlassCard style={styles.factsCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="format-list-bulleted" size={18} color={Vitality.primary} />
              <Text style={styles.cardTitle}>Nutrition Facts</Text>
            </View>
            
            <NutrientRow label="Total Carbohydrates" value={`${Math.round(log.carbs || 0)}g`} isBold />
            <NutrientRow label="Dietary Fiber" value={`${Math.round(log.fiber || 0)}g`} isChild />
            <NutrientRow label="Sugar" value={`${Math.round(log.sugar || 0)}g`} isChild />
            <NutrientRow label="Added Sugars" value={`${Math.round(log.addedSugar || 0)}g`} isChild />
            <NutrientRow label="Sugar Alcohols" value={`${Math.round(log.sugarAlcohols || 0)}g`} isChild />
            <NutrientRow label="Net Carbs" value={`${Math.round((log.carbs || 0) - (log.fiber || 0))}g`} isChild />
            
            <SectionDivider />
            
            <NutrientRow label="Protein" value={`${Math.round(log.protein || 0)}g`} isBold />
            
            <SectionDivider />

            <NutrientRow label="Total Fat" value={`${Math.round(log.fat || 0)}g`} isBold />
            <NutrientRow label="Saturated Fat" value={`${Math.round(log.saturatedFat || 0)}g`} isChild />
            <NutrientRow label="Trans Fat" value={`${Math.round(log.transFat || 0)}g`} isChild />
            <NutrientRow label="Polyunsaturated Fat" value={`${Math.round(log.polyunsaturatedFat || 0)}g`} isChild />
            <NutrientRow label="Monounsaturated Fat" value={`${Math.round(log.monounsaturatedFat || 0)}g`} isChild />
            
            <SectionDivider />

            <NutrientRow label="Cholesterol" value={`${Math.round(log.cholesterol || 0)}mg`} />
            <NutrientRow label="Sodium" value={`${Math.round(log.sodium || 0)}mg`} />
            <NutrientRow label="Potassium" value={`${Math.round(log.potassium || 0)}mg`} />
            
            <SectionDivider />
            
            <NutrientRow label="Calcium" value={`${Math.round(log.calcium || 0)}mg`} />
            <NutrientRow label="Iron" value={`${Math.round(log.iron || 0)}mg`} />
            <NutrientRow label="Vitamin A" value={`${Math.round(log.vitaminA || 0)}IU`} />
            <NutrientRow label="Vitamin C" value={`${Math.round(log.vitaminC || 0)}mg`} />
            <NutrientRow label="Vitamin D" value={`${Math.round(log.vitaminD || 0)}IU`} />
          </GlassCard>
        </Animated.View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Vitality.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Vitality.text,
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 20,
  },
  foodName: {
    fontSize: 22,
    fontWeight: '800',
    color: Vitality.text,
    marginBottom: 4,
  },
  timeTag: {
    fontSize: 13,
    color: Vitality.textMuted,
    fontWeight: '600',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  macroLabel: {
    fontSize: 12,
    color: Vitality.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Vitality.text,
    marginBottom: 8,
  },
  macroBarContainer: {
    height: 4,
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: Vitality.textMuted,
  },
  analysisCard: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Vitality.text,
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 22,
    color: Vitality.text,
    opacity: 0.9,
    fontWeight: '500',
  },
  factsCard: {
    padding: 20,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  childRow: {
    paddingLeft: 20,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(89, 222, 155, 0.2)',
    marginLeft: 5,
  },
  nutrientLabel: {
    fontSize: 14,
    color: Vitality.textMuted,
    fontWeight: '600',
  },
  nutrientValue: {
    fontSize: 14,
    color: Vitality.text,
    fontWeight: '700',
  },
  boldLabel: {
    color: Vitality.text,
    fontWeight: '800',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
  errorText: {
    color: Vitality.textMuted,
    fontSize: 16,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Vitality.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
  },
  backBtnText: {
    color: '#000',
    fontWeight: '800',
  },
});
