import { useUser } from "@clerk/clerk-expo";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { VitalityDashboard } from "../../components/stitch/VitalityDashboard";
import { db } from "../../lib/firebase";
import { BentoInsight, generateBentoInsights, GeneratedFitnessPlan } from "../../lib/gemini";
import { fetchCachedBentoInsights, fetchDailyProgress, saveBentoInsights, fetchUserPlan, DayProgress } from "../../lib/tracking";
import { Vitality } from "../../constants/Colors";

export default function Analytics() {
  const { user } = useUser();
  
  const [weight, setWeight] = useState<string>('--');
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<GeneratedFitnessPlan | null>(null);
  const [progress, setProgress] = useState<DayProgress>({
    totalCalories: 0,
    totalBurnedCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalWaterMl: 0,
  });

  const [insights, setInsights] = useState<BentoInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // 1. Fetch User Weight
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

        // 2. Fetch User Plan
        const userPlan = await fetchUserPlan(user.id);
        if (userPlan) setPlan(userPlan as GeneratedFitnessPlan);

        // 3. Fetch Today's Progress
        const todayProgress = await fetchDailyProgress(user.id, new Date());
        setProgress(todayProgress);

        // 4. Fetch AI Insights
        loadAIInsights(user.id, currentWeight);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setLoading(false);
      }
    };

    const loadAIInsights = async (userId: string, currentWeight: string) => {
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

        // Need last 7 days for generation (mimicking original logic)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); 
        const streakPromises = Array.from({ length: 7 }).map((_, i) => {
          const dateToCheck = new Date(startOfWeek);
          dateToCheck.setDate(startOfWeek.getDate() + i);
          return fetchDailyProgress(userId, dateToCheck);
        });
        const weekResults = await Promise.all(streakPromises);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Vitality.primary} />
      </View>
    );
  }

  return (
    <VitalityDashboard 
      plan={plan}
      progress={progress}
      insights={insights}
      insightsLoading={insightsLoading}
      weight={weight}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Vitality.background
  }
});
