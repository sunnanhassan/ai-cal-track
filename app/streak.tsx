import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Vitality } from '../constants/Colors';
import { calculateStreak, fetchWeeklyMetrics, formatDateString } from '../lib/tracking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '../components/stitch/GlassCard';

const MetricCard = ({ label, value, unit, icon, color, delay }: any) => (
  <Animated.View entering={FadeInUp.delay(delay)} style={styles.metricCardWrapper}>
    <GlassCard style={styles.metricCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}<Text style={styles.metricUnit}> {unit}</Text></Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </GlassCard>
  </Animated.View>
);

const DayCircle = ({ day, active, current }: { day: string, active: boolean, current: boolean }) => (
  <View style={styles.dayCircleWrapper}>
    <View style={[
      styles.dayCircle, 
      active && styles.activeDayCircle,
      current && styles.currentDayCircle
    ]}>
      {active && <MaterialCommunityIcons name="check" size={14} color="#000" />}
    </View>
    <Text style={[styles.dayText, current && styles.currentDayText]}>{day}</Text>
  </View>
);

export default function StreakScreen() {
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<{current: number, longest: number, loggedDates: string[]}>({
    current: 0, longest: 0, loggedDates: []
  });
  const [metrics, setMetrics] = useState({ averageCalories: 0, totalUnderBudget: 0 });
  const [weight, setWeight] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        
        // 1. Fetch Streak
        const streak = await calculateStreak(user.id);
        setStreakData(streak);

        // 2. Fetch User Weight & Target
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        let targetCals = 2000;
        if (userSnap.exists()) {
          const ud = userSnap.data();
          setWeight(ud.weight || 0);
          targetCals = ud.generatedPlan?.dailyTarget?.calories || 2000;
        }

        // 3. Fetch Weekly Metrics
        const weekly = await fetchWeeklyMetrics(user.id, targetCals);
        setMetrics(weekly);

      } catch (err) {
        console.error("Error loading streak data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDayIndex = today.getDay();

  const isLogged = (dayOffset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    return streakData.loggedDates.includes(formatDateString(d));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Vitality.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Vitality.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journey Stats</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Streak Main Card */}
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.streakHero}>
            <View style={styles.streakIconCircle}>
              <MaterialCommunityIcons name="lightning-bolt" size={50} color={Vitality.primary} />
              <View style={styles.glowEffect} />
            </View>
            <View style={styles.streakInfo}>
              <View style={styles.streakRow}>
                <View>
                  <Text style={styles.streakNumber}>{streakData.current}</Text>
                  <Text style={styles.streakLabel}>Current Streak</Text>
                </View>
                <View style={styles.streakDivider} />
                <View>
                  <Text style={styles.streakNumber}>{streakData.longest}</Text>
                  <Text style={styles.streakLabel}>Longest Streak</Text>
                </View>
              </View>
              <Text style={styles.loggedDaysText}>Logged Days</Text>
            </View>
          </View>
        </Animated.View>

        {/* Weekly View */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <GlassCard style={styles.weeklyCard}>
            <Text style={styles.cardTitle}>Current Week</Text>
            <View style={styles.weekRow}>
              {weekDays.map((day, i) => {
                const dayOffset = currentDayIndex - i;
                return (
                  <DayCircle 
                    key={i} 
                    day={day} 
                    active={dayOffset >= 0 ? isLogged(dayOffset) : false} 
                    current={i === currentDayIndex}
                  />
                );
              })}
            </View>
            
            <View style={styles.grid}>
              <View style={styles.gridRow}>
                <MetricCard 
                  label="Budget Balance" 
                  value={metrics.totalUnderBudget} 
                  unit="kcal" 
                  icon="calculator" 
                  color={Vitality.primary} 
                  delay={300} 
                />
                <MetricCard 
                  label="Avg Intake" 
                  value={metrics.averageCalories} 
                  unit="kcal" 
                  icon="chart-donut" 
                  color="#FBBC00" 
                  delay={400} 
                />
              </View>
              <View style={styles.gridRow}>
                <MetricCard 
                  label="Current Weight" 
                  value={weight} 
                  unit="kg" 
                  icon="weight-lifter" 
                  color="#667eea" 
                  delay={500} 
                />
                <TouchableOpacity style={styles.summaryBtnWrapper} onPress={() => router.push('/(tabs)/analytics')}>
                  <GlassCard style={styles.summaryBtn}>
                    <Text style={styles.summaryBtnText}>Full Report</Text>
                    <Ionicons name="arrow-forward" size={16} color={Vitality.text} />
                  </GlassCard>
                </TouchableOpacity>
              </View>
            </View>
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Vitality.text,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
  },
  streakHero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 10,
  },
  streakIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(89, 222, 155, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  glowEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Vitality.primary,
    opacity: 0.15,
  },
  streakInfo: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: Vitality.text,
    letterSpacing: -1,
    lineHeight: 44,
  },
  streakLabel: {
    fontSize: 12,
    color: Vitality.textMuted,
    fontWeight: '600',
    marginTop: -2,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  loggedDaysText: {
    fontSize: 14,
    fontWeight: '700',
    color: Vitality.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  weeklyCard: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Vitality.text,
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dayCircleWrapper: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeDayCircle: {
    backgroundColor: Vitality.primary,
    borderColor: Vitality.primary,
  },
  currentDayCircle: {
    borderColor: Vitality.primary,
    borderWidth: 2,
  },
  dayText: {
    fontSize: 12,
    color: Vitality.textMuted,
    fontWeight: '700',
  },
  currentDayText: {
    color: Vitality.primary,
  },
  grid: {
    marginTop: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCardWrapper: {
    width: '48%',
  },
  metricCard: {
    padding: 16,
    height: 120,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Vitality.text,
  },
  metricUnit: {
    fontSize: 12,
    color: Vitality.textMuted,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 13,
    color: Vitality.textMuted,
    fontWeight: '500',
  },
  summaryBtnWrapper: {
    width: '48%',
  },
  summaryBtn: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89, 222, 155, 0.05)',
    borderColor: 'rgba(89, 222, 155, 0.2)',
  },
  summaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Vitality.text,
    marginBottom: 8,
  },
});
