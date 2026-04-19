import { useUser } from "@clerk/clerk-expo";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { VitalityMain } from "../../components/stitch/VitalityMain";
import { useDateStore } from "../../lib/date-store";
import { db } from "../../lib/firebase";
import { DayProgress, DailyLog, fetchDailyEntries, formatDateString } from "../../lib/tracking";
import { useRouter } from "expo-router";
import { Vitality } from "../../constants/Colors";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const selectedDate = useDateStore((state) => state.selectedDate);
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<DayProgress>({
    totalCalories: 0,
    totalBurnedCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalWaterMl: 0,
  });
  const [entries, setEntries] = useState<DailyLog[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Real-time user profile listener (for targets)
    const userRef = doc(db, 'users', user.id);
    const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
      setProfileLoading(false);
    });

    const dateStr = formatDateString(selectedDate);
    const logRef = doc(db, 'users', user.id, 'daily_summaries', dateStr);

    // Real-time progress listener
    const unsubscribeProgress = onSnapshot(logRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProgress({
          totalCalories: data.totalCalories || 0,
          totalBurnedCalories: data.totalBurnedCalories || 0,
          totalProtein: data.totalProtein || 0,
          totalFat: data.totalFat || 0,
          totalCarbs: data.totalCarbs || 0,
          totalWaterMl: data.totalWaterMl || 0,
        });
      } else {
        setProgress({
          totalCalories: 0,
          totalBurnedCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          totalWaterMl: 0,
        });
      }
      setLoading(false);
    });

    // Real-time entries listener
    const entriesRef = collection(db, 'users', user.id, 'daily_summaries', dateStr, 'entries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    const unsubscribeEntries = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyLog[]);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeProgress();
      unsubscribeEntries();
    };
  }, [user?.id, selectedDate]);

  if (loading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Vitality.primary} />
      </View>
    );
  }

  return (
    <VitalityMain 
      progress={progress}
      entries={entries}
      userProfile={userProfile}
      userId={user?.id || ''}
      onSearchPress={() => router.push('/(tabs)/log-food')}
      onLogPress={(item) => router.push(`/meal-detail?id=${item.id}`)}
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
