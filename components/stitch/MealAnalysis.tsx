import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';
import { GlassCard } from './GlassCard';
import { MacroRing } from './MacroProgress';
import { useRouter } from 'expo-router';

export const MealAnalysis: React.FC = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Vitality.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meal Detail</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color={Vitality.text} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Green Salad with</Text>
          <Text style={[styles.mainTitle, { color: Vitality.primary }]}>Grilled Chicken</Text>
        </View>

        {/* Calories Badge */}
        <View style={styles.caloriesBadge}>
          <MaterialCommunityIcons name="fire" size={16} color={Vitality.primary} />
          <Text style={styles.caloriesText}>445 kcal</Text>
        </View>

        {/* AI Insight Card */}
        <GlassCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.leafCircle}>
              <MaterialCommunityIcons name="leaf" size={20} color={Vitality.primary} />
            </View>
            <Text style={styles.insightTitle}>AI Health Insight</Text>
          </View>
          <Text style={styles.insightText}>
            This meal is an excellent source of lean protein, supporting muscle recovery. The high fiber content from the greens promotes sustained energy and digestive health. It's a nutrient-dense choice that perfectly balances your macronutrient profile for the day.
          </Text>
        </GlassCard>

        {/* Macro Grid */}
        <View style={styles.macroGrid}>
          <View style={styles.macroRow}>
            <GlassCard style={styles.macroMiniCard}>
              <MacroRing percentage={23} label="CAL" size={56} />
              <Text style={styles.macroMiniLabel}>CAL</Text>
            </GlassCard>
            <GlassCard style={styles.macroMiniCard}>
              <MacroRing percentage={70} label="PROTEIN" size={56} />
              <Text style={styles.macroMiniText}>35g</Text>
              <Text style={styles.macroMiniLabel}>PROTEIN</Text>
            </GlassCard>
          </View>
          <View style={styles.macroRow}>
            <GlassCard style={styles.macroMiniCard}>
              <MacroRing percentage={45} label="CARBS" size={56} />
              <Text style={styles.macroMiniText}>35g</Text>
              <Text style={styles.macroMiniLabel}>CARBS</Text>
            </GlassCard>
            <GlassCard style={styles.macroMiniCard}>
              <MacroRing percentage={30} label="FAT" size={56} />
              <Text style={styles.macroMiniText}>15g</Text>
              <Text style={styles.macroMiniLabel}>FAT</Text>
            </GlassCard>
          </View>
        </View>

        {/* Nutrition Facts Section */}
        <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <Text style={styles.dailyReportText}>Daily Report 2026</Text>
        </View>

        <GlassCard style={styles.nutritionCard}>
          {/* Carbohydrates */}
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Carbohydrates</Text>
            <Text style={[styles.nutritionValue, { color: Vitality.primary }]}>35g</Text>
          </View>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Dietary Fiber</Text>
            <Text style={styles.nutritionSubValue}>8g</Text>
          </View>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Sugars</Text>
            <Text style={styles.nutritionSubValue}>5g</Text>
          </View>

          <View style={styles.itemSeparator} />

          {/* Fat */}
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Total Fat</Text>
            <Text style={[styles.nutritionValue, { color: Vitality.error }]}>15g</Text>
          </View>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Saturated Fat</Text>
            <Text style={styles.nutritionSubValue}>2.5g</Text>
          </View>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Polyunsaturated</Text>
            <Text style={styles.nutritionSubValue}>6g</Text>
          </View>

          <View style={styles.itemSeparator} />

          {/* Vitamins */}
          <Text style={styles.groupLabel}>VITAMINS & MINERALS</Text>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Calcium</Text>
            <Text style={[styles.nutritionSubValue, { color: Vitality.primary }]}>12%</Text>
          </View>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Iron</Text>
            <Text style={[styles.nutritionSubValue, { color: Vitality.primary }]}>15%</Text>
          </View>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Vitamin A</Text>
            <Text style={[styles.nutritionSubValue, { color: Vitality.primary }]}>80%</Text>
          </View>
          <View style={styles.nutritionSubItem}>
            <Text style={styles.nutritionSubLabel}>Vitamin C</Text>
            <Text style={[styles.nutritionSubValue, { color: Vitality.primary }]}>45%</Text>
          </View>

          <View style={styles.itemSeparator} />

          {/* Footer Metrics */}
          <View style={styles.nutritionFooter}>
            <View>
              <Text style={styles.footerLabel}>CHOLESTEROL</Text>
              <Text style={styles.footerValue}>85mg</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>SODIUM</Text>
              <Text style={styles.footerValue}>420mg</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Vitality.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Vitality.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Vitality.text,
    lineHeight: 40,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 16,
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  caloriesText: {
    color: Vitality.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  insightCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 32,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leafCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(89, 222, 155, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Vitality.text,
  },
  insightText: {
    fontSize: 14,
    color: Vitality.textMuted,
    lineHeight: 22,
  },
  macroGrid: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroMiniCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  macroMiniText: {
    fontSize: 16,
    fontWeight: '700',
    color: Vitality.text,
    marginTop: 8,
  },
  macroMiniLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Vitality.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  sectionDivider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Vitality.text,
  },
  dailyReportText: {
    fontSize: 12,
    color: Vitality.textMuted,
  },
  nutritionCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 0, // Inner padding is handled by list items
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 8,
  },
  nutritionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Vitality.text,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  nutritionSubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  nutritionSubLabel: {
    fontSize: 14,
    color: Vitality.text,
    marginLeft: 12,
  },
  nutritionSubValue: {
    fontSize: 14,
    color: Vitality.text,
    fontWeight: '600',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Vitality.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  nutritionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Vitality.textMuted,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Vitality.text,
    marginTop: 4,
  },
});

export default MealAnalysis;
