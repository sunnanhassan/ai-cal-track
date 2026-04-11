import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../lib/firebase";
import { BentoInsight, generateBentoInsights } from "../../lib/gemini";
import { fetchCachedBentoInsights, fetchDailyProgress, saveBentoInsights } from "../../lib/tracking";
import { useRouter } from "expo-router";

export default function Analytics() {
  const { user } = useUser();
  const router = useRouter();
  const { colors, theme: activeTheme } = useTheme();
  
  const [weight, setWeight] = useState<string>('--');
  const [loading, setLoading] = useState(true);
  const [isStreakModalVisible, setIsStreakModalVisible] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [weekStreak, setWeekStreak] = useState<boolean[]>(Array(7).fill(false));
  const [weekData, setWeekData] = useState<any[]>(Array(7).fill({ totalCalories: 0 }));
  const [insights, setInsights] = useState<BentoInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        let currentWeight = '--';
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.weight) {
            currentWeight = String(data.weight);
            setWeight(currentWeight);
          }
        }

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); 

        const streakPromises = Array.from({ length: 7 }).map((_, i) => {
          const dateToCheck = new Date(startOfWeek);
          dateToCheck.setDate(startOfWeek.getDate() + i);
          return fetchDailyProgress(user.id, dateToCheck);
        });

        const weekResults = await Promise.all(streakPromises);
        
        const streakData = weekResults.map((progress) => {
          return (
            progress.totalCalories > 0 || 
            progress.totalBurnedCalories > 0 || 
            progress.totalWaterMl > 0
          );
        });

        setWeekStreak(streakData);
        setWeekData(weekResults);
        setLoading(false);

        loadAIInsights(user.id, weekResults, currentWeight);

      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setLoading(false);
      }
    };

    const loadAIInsights = async (userId: string, weekResults: any[], currentWeight: string) => {
      try {
        setInsightsLoading(true);
        const cached = await fetchCachedBentoInsights(userId);
        
        if (cached && cached.lastGeneratedAt) {
          const lastGen = new Date(cached.lastGeneratedAt).getTime();
          const now = Date.now();
          const hoursPassed = (now - lastGen) / (1000 * 60 * 60);

          if (hoursPassed < 6) {
            setInsights(cached.data);
            setInsightsLoading(false);
            return;
          }
        }

        const aiInsights = await generateBentoInsights(weekResults, currentWeight);
        if (aiInsights && aiInsights.length > 0) {
          setInsights(aiInsights);
          await saveBentoInsights(userId, aiInsights);
        }
      } catch (err) {
        console.error("Error loading AI insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const chartConfig = useMemo(() => ({
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => activeTheme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(15, 23, 42, ${opacity})`,
    labelColor: (opacity = 1) => colors.textMuted,
    propsForBackgroundLines: {
      stroke: colors.border,
      strokeDasharray: '0',
    }
  }), [colors, activeTheme]);

  const currentStreakCount = weekStreak.filter(Boolean).length;
  const totalWeeklyConsumed = weekData.reduce((sum, d) => sum + (d.totalCalories || 0), 0);
  const totalWeeklyBurned = weekData.reduce((sum, d) => sum + (d.totalBurnedCalories || 0), 0);
  const netEnergy = totalWeeklyConsumed - totalWeeklyBurned;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>View your trends and history.</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.cardsRow}>
              <TouchableOpacity 
                style={[styles.card, styles.streakCard]}
                onPress={() => setIsStreakModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.streakHeader}>
                  <Image source={require('../../assets/images/fire.png')} style={styles.fireIcon} resizeMode="contain" />
                  <Text style={styles.streakCount}>{currentStreakCount}</Text>
                </View>
                <Text style={styles.cardTitle}>Day Streak</Text>
                <View style={styles.weekContainer}>
                  {daysOfWeek.map((day, idx) => (
                    <View key={idx} style={styles.dayColumn}>
                      <Text style={styles.dayLabel}>{day}</Text>
                      <View style={[styles.checkbox, weekStreak[idx] && styles.checkboxActive]} />
                    </View>
                  ))}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, styles.weightCard]}
                onPress={() => router.push('/update-weight')}
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitle}>My Weight</Text>
                <Text style={styles.weightValue}>{weight} <Text style={styles.weightUnit}>kg</Text></Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bentoSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AI Health Coaching</Text>
                {insightsLoading && <ActivityIndicator size="small" color={colors.primary} />}
              </View>

              <View style={styles.bentoGrid}>
                {insightsLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.bentoItem, styles.skeletonItem, { minHeight: i % 2 === 0 ? 160 : 120 }]} />
                  ))
                ) : (
                  insights.map((insight, idx) => (
                    <View 
                      key={idx} 
                      style={[
                        styles.bentoItem, 
                        { 
                          backgroundColor: colors.surface + (activeTheme === 'dark' ? 'AA' : 'F0'), 
                          minHeight: idx === 0 || idx === 3 ? 190 : 155,
                          borderColor: getInsightColor(insight.type, colors.primary),
                          borderLeftWidth: 4,
                        }
                      ]}
                    >
                      <View>
                        <View style={styles.bentoHeader}>
                          <Ionicons name={insight.icon as any} size={20} color={getInsightColor(insight.type, colors.primary)} />
                          <Text style={styles.bentoTitle} numberOfLines={1}>{insight.title}</Text>
                        </View>
                        <Text style={[styles.bentoValue, { color: getInsightColor(insight.type, colors.primary) }]}>{insight.value}</Text>
                      </View>
                      <Text style={styles.bentoInsightText}>{insight.insight}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={[styles.card, { marginTop: 24, padding: 20 }]}>
              <Text style={styles.cardTitle}>Weekly Energy Balance</Text>
              <View style={styles.energyStatsRow}>
                 <View style={styles.energyStat}>
                    <Text style={styles.energyValue}>{totalWeeklyBurned.toLocaleString()}</Text>
                    <Text style={styles.energyLabel}>Energy Burned</Text>
                 </View>
                 <View style={styles.energyDivider} />
                 <View style={styles.energyStat}>
                    <Text style={styles.energyValue}>{totalWeeklyConsumed.toLocaleString()}</Text>
                    <Text style={styles.energyLabel}>Energy Consumed</Text>
                 </View>
                 <View style={styles.energyDivider} />
                 <View style={styles.energyStat}>
                    <Text style={[styles.energyValue, { color: netEnergy > 0 ? '#EF4444' : colors.primary }]}>
                      {netEnergy > 0 ? '+' : ''}{netEnergy.toLocaleString()}
                    </Text>
                    <Text style={styles.energyLabel}>Net Energy</Text>
                 </View>
              </View>

              <View style={{ marginTop: 24 }}>
                <BarChart
                  data={{
                    labels: daysOfWeek,
                    datasets: [
                      {
                        data: weekData.map((d) => d.totalCalories || 0),
                        color: (opacity = 1) => `rgba(41, 143, 80, ${opacity})`,
                      },
                      {
                        data: weekData.map((d) => d.totalBurnedCalories || 0),
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                      }
                    ],
                    legend: ["Consumed", "Burned"]
                  }}
                  width={Dimensions.get("window").width - 80}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  style={{ marginVertical: 8, borderRadius: 16 }}
                  fromZero={true}
                  flatColor={true}
                  withInnerLines={true}
                  showBarTops={false}
                />
              </View>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendText}>Consumed</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Burned</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { marginTop: 16, padding: 20, marginBottom: 40 }]}>
              <View style={styles.chartHeader}>
                <Text style={styles.cardTitle}>Water Consumption</Text>
                <Text style={[styles.chartValue, { color: activeTheme === 'dark' ? '#60A5FA' : '#0EA5E9' }]}>
                   {weekData.reduce((sum, d) => sum + (d.totalWaterMl || 0), 0).toLocaleString()} <Text style={styles.unitSmall}>ml</Text>
                </Text>
              </View>
              <LineChart
                data={{
                  labels: daysOfWeek,
                  datasets: [
                    {
                      data: weekData.map((d) => d.totalWaterMl || 0),
                      color: (opacity = 1) => activeTheme === 'dark' ? `rgba(96, 165, 250, ${opacity})` : `rgba(14, 165, 233, ${opacity})`,
                      strokeWidth: 3
                    }
                  ],
                }}
                width={Dimensions.get("window").width - 80}
                height={220}
                bezier
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => activeTheme === 'dark' ? `rgba(96, 165, 250, ${opacity})` : `rgba(14, 165, 233, ${opacity})`,
                  propsForDots: { r: "4", strokeWidth: "2", stroke: activeTheme === 'dark' ? '#60A5FA' : '#0EA5E9' },
                }}
                style={{ marginVertical: 16, borderRadius: 16, alignSelf: 'center' }}
                fromZero={true}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={isStreakModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsStreakModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalCloseHeader}>
               <Text style={styles.modalTitle}>Daily Streak Details</Text>
               <TouchableOpacity onPress={() => setIsStreakModalVisible(false)} style={styles.closeButton}>
                 <Text style={styles.closeText}>Close</Text>
               </TouchableOpacity>
            </View>
            <View style={[styles.card, styles.largeCard]}>
              <View style={styles.largeStreakHeader}>
                <View style={styles.largeStreakCountWrap}>
                  <Image source={require('../../assets/images/fire.png')} style={styles.largeFireIcon} resizeMode="contain" />
                  <Text style={styles.largeStreakCount}>{currentStreakCount}</Text>
                </View>
                <View style={styles.chipContainer}>
                    <Text style={styles.chipText}>Keep it Going 🔥</Text>
                </View>
              </View>
              <Text style={styles.largeCardTitle}>Day Streak</Text>
              <View style={styles.largeWeekContainer}>
                {daysOfWeek.map((day, idx) => (
                  <View key={idx} style={styles.dayColumn}>
                    <Text style={styles.largeDayLabel}>{day}</Text>
                    <View style={[styles.largeCheckbox, weekStreak[idx] && styles.checkboxActive]} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center'
  },
  content: {
    paddingHorizontal: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakCard: {
    flex: 1.5,
    marginRight: 12,
  },
  weightCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fireIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  streakCount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '500',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  checkboxActive: {
    backgroundColor: '#EF4444', 
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  weightUnit: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: 'normal',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalCloseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  closeText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  largeCard: {
    padding: 24,
  },
  largeStreakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  largeStreakCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeFireIcon: {
    width: 48,
    height: 48,
    marginRight: 10,
  },
  largeStreakCount: {
    color: colors.text,
    fontSize: 48,
    fontWeight: 'bold',
  },
  chipContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
  largeCardTitle: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  largeWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  largeDayLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  largeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  energyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  energyStat: {
    flex: 1,
    alignItems: 'center',
  },
  energyDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  energyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  energyLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitSmall: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'normal',
  },
  bentoSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  bentoItem: {
    width: '48%', 
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  skeletonItem: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  bentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bentoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
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
    color: colors.text,
    lineHeight: 18,
    opacity: 0.9,
    flexShrink: 1,
  }
});

function getInsightColor(type: string, primary: string) {
  switch (type) {
    case 'success': return '#10B981';
    case 'warning': return '#F59E0B';
    case 'error': return '#EF4444';
    case 'info': return '#3B82F6';
    default: return primary;
  }
}
