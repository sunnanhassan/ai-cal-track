import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';
import { GlassCard } from './GlassCard';
import { MacroRing, ProgressBar } from './MacroProgress';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

import { GeneratedFitnessPlan } from '../../lib/gemini';
import { DayProgress } from '../../lib/tracking';
import { useMenuStore } from '../../lib/menu-store';

interface BentoInsight {
  type: string;
  icon: string;
  title: string;
  value: string;
  insight: string;
}

interface VitalityDashboardProps {
  plan: GeneratedFitnessPlan | null;
  progress: DayProgress;
  insights: BentoInsight[];
  insightsLoading: boolean;
  weight: string;
}

export const VitalityDashboard: React.FC<VitalityDashboardProps> = ({ 
  plan, 
  progress, 
  insights, 
  insightsLoading, 
  weight 
}) => {
  const router = useRouter();
  const toggleMenu = useMenuStore((state) => state.toggleMenu);
  // Priority: 1. AI Plan, 2. Dynamic User Profile target, 3. Hard fallback
  const targetCalories = plan?.dailyCalories || (progress as any).dailyCalories || 2000;
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={toggleMenu}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={24} color={Vitality.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Goals</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Main Calorie Card */}
        <GlassCard style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <Text style={styles.cardLabel}>DAILY CALORIE TARGET</Text>
            <MaterialCommunityIcons name="flash" size={20} color={Vitality.primary} />
          </View>
          
          <View style={styles.calorieMain}>
            <Text style={styles.calorieValue}>{targetCalories}</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>

          <TouchableOpacity style={styles.calculatorButton}>
            <View style={styles.calcIconContainer}>
              <Ionicons name="calculator" size={16} color={Vitality.tertiary} />
            </View>
            <Text style={styles.calcButtonText}>Target adjusted by activity level</Text>
            <Ionicons name="chevron-forward" size={16} color={Vitality.textMuted} />
          </TouchableOpacity>
        </GlassCard>

        {/* AI Health Coaching Section (Original Bento Grid) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Health Coaching</Text>
          {insightsLoading && <ActivityIndicator size="small" color={Vitality.primary} />}
        </View>

        <View style={styles.bentoGrid}>
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <GlassCard 
                key={idx} 
                style={[
                  styles.bentoItem, 
                  { 
                    minHeight: idx === 0 || idx === 3 ? 190 : 155,
                    borderLeftColor: getInsightColor(insight.type),
                    borderLeftWidth: 4,
                  }
                ]}
              >
                <View>
                  <View style={styles.bentoHeader}>
                    <Ionicons name={insight.icon as any} size={20} color={getInsightColor(insight.type)} />
                    <Text style={styles.bentoTitle} numberOfLines={1}>{insight.title}</Text>
                  </View>
                  <Text style={[styles.bentoValue, { color: getInsightColor(insight.type) }]}>{insight.value}</Text>
                </View>
                <Text style={styles.bentoInsightText}>{insight.insight}</Text>
              </GlassCard>
            ))
          ) : !insightsLoading && (
            <View style={styles.emptyInsights}>
              <Text style={styles.emptyText}>Updating AI Insights...</Text>
            </View>
          )}
        </View>

        {/* Macro Distribution Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Macro Distribution</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Target Values</Text>
          </View>
        </View>

        {/* Carbohydrates Card */}
        <GlassCard style={styles.macroCard}>
          <View style={styles.macroRow}>
            <View>
              <Text style={styles.cardLabel}>Carbohydrates</Text>
              <View style={styles.macroValueRow}>
                <Text style={styles.macroValue}>{plan?.macros.carbsGrams || 250}</Text>
                <Text style={styles.macroUnit}>g</Text>
              </View>
            </View>
            <MacroRing percentage={progress.totalCarbs / (plan?.macros.carbsGrams || 250) * 100} label="Carbs" size={60} />
          </View>
          <ProgressBar percentage={progress.totalCarbs / (plan?.macros.carbsGrams || 250) * 100} />
        </GlassCard>

        {/* Protein & Fat Card */}
        <GlassCard style={styles.macroCard}>
          <View style={styles.macroSmallRow}>
            <View style={styles.macroSmallDetail}>
              <Text style={styles.cardLabel}>Protein</Text>
              <View style={styles.macroSmallValueRow}>
                <Text style={styles.macroSmallText}>{plan?.macros.proteinGrams || 125}g</Text>
                <Text style={[styles.macroSmallText, { color: Vitality.primary }]}> (Goal)</Text>
              </View>
              <ProgressBar percentage={progress.totalProtein / (plan?.macros.proteinGrams || 125) * 100} color={Vitality.tertiary} />
            </View>
          </View>

          <View style={[styles.macroSmallRow, { marginTop: 24 }]}>
            <View style={styles.macroSmallDetail}>
              <Text style={styles.cardLabel}>Fat</Text>
              <View style={styles.macroSmallValueRow}>
                <Text style={styles.macroSmallText}>{plan?.macros.fatsGrams || 56}g</Text>
                <Text style={[styles.macroSmallText, { color: Vitality.primary }]}> (Goal)</Text>
              </View>
              <ProgressBar percentage={progress.totalFat / (plan?.macros.fatsGrams || 56) * 100} color={Vitality.secondary} />
            </View>
          </View>
        </GlassCard>

        {/* Split Cards: Hydration & Weight */}
        <View style={styles.splitRow}>
          <GlassCard style={styles.splitCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="water" size={20} color={Vitality.primary} />
            </View>
            <Text style={styles.cardLabel}>Hydration</Text>
            <View style={styles.splitValueRow}>
              <Text style={styles.splitValue}>{(progress.totalWaterMl / 1000).toFixed(1)}</Text>
              <Text style={styles.splitUnit}>Liters</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.splitCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="scale-bathroom" size={20} color={Vitality.tertiary} />
            </View>
            <Text style={styles.cardLabel}>My Weight</Text>
            <View style={styles.splitValueRow}>
              <Text style={styles.splitValue}>{weight}</Text>
              <Text style={styles.splitUnit}>kg</Text>
            </View>
          </GlassCard>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={Vitality.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Based on your profile, this distribution ensures optimal metabolic efficiency and sustainable energy throughout the day.
          </Text>
        </View>

        {/* Bottom CTA */}
        <TouchableOpacity style={styles.mainCTA}>
          <LinearGradient
            colors={[Vitality.primary, Vitality.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Recalculate Plan</Text>
            <Ionicons name="refresh-circle" size={20} color="#003921" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getInsightColor = (type: string) => {
  switch (type) {
    case 'success': return '#10B981';
    case 'warning': return '#F59E0B';
    case 'error': return '#EF4444';
    case 'info': return '#3B82F6';
    default: return Vitality.primary;
  }
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
    fontSize: 24,
    fontWeight: '700',
    color: Vitality.primary,
  },
  iconButton: {
    padding: 8,
  },
  profileButton: {
    padding: 4,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Vitality.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Vitality.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  calorieCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 32,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 12,
  },
  calorieValue: {
    fontSize: 72,
    fontWeight: '800',
    color: Vitality.text,
    letterSpacing: -2,
  },
  calorieUnit: {
    fontSize: 24,
    fontWeight: '600',
    color: Vitality.primary,
    marginLeft: 8,
  },
  calculatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 12,
    marginTop: 16,
  },
  calcIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 188, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calcButtonText: {
    flex: 1,
    color: Vitality.text,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Vitality.text,
  },
  badge: {
    backgroundColor: 'rgba(89, 222, 155, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: Vitality.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  macroCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Vitality.text,
  },
  macroUnit: {
    fontSize: 16,
    color: Vitality.textMuted,
    marginLeft: 4,
  },
  macroSmallRow: {
    width: '100%',
  },
  macroSmallDetail: {
    flex: 1,
  },
  macroSmallValueRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  macroSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: Vitality.text,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  splitCard: {
    width: (width - 44) / 2, // 16px margins + 12px gap
    borderRadius: 24,
    marginBottom: 32,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  splitValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  splitValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Vitality.text,
  },
  splitUnit: {
    fontSize: 12,
    color: Vitality.textMuted,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(89, 222, 155, 0.05)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 40,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    flex: 1,
    color: Vitality.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  mainCTA: {
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  ctaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#131318',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  bentoItem: {
    width: '48%', 
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bentoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Vitality.textMuted,
    marginLeft: 6,
    flex: 1,
  },
  bentoValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 28,
  },
  bentoInsightText: {
    fontSize: 12,
    color: Vitality.text,
    lineHeight: 18,
    opacity: 0.9,
    flexShrink: 1,
  },
  emptyInsights: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Vitality.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VitalityDashboard;
