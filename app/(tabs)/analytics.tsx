import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { fetchDailyProgress } from "../../lib/tracking";
import { useRouter } from "expo-router";

export default function Analytics() {
  const { user } = useUser();
  const router = useRouter();
  const [weight, setWeight] = useState<string>('--');
  const [loading, setLoading] = useState(true);
  const [isStreakModalVisible, setIsStreakModalVisible] = useState(false);

  // We'll store a boolean for each day of the current week (Sun - Sat)
  const [weekStreak, setWeekStreak] = useState<boolean[]>(Array(7).fill(false));
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // 1. Fetch User Weight
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.weight) {
            setWeight(String(data.weight));
          }
        }

        // 2. Fetch Weekly Activity
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Go to Sunday

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

      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const currentStreakCount = weekStreak.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>View your trends and history.</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.cardsRow}>
              
              {/* Daily Streak Card */}
              <TouchableOpacity 
                style={[styles.card, styles.streakCard]}
                onPress={() => setIsStreakModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.streakHeader}>
                  <Image 
                    source={require('../../assets/images/fire.png')} 
                    style={styles.fireIcon} 
                    resizeMode="contain" 
                  />
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

              {/* My Weight Card */}
              <TouchableOpacity
                style={[styles.card, styles.weightCard]}
                onPress={() => router.push('/update-weight')}
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitle}>My Weight</Text>
                <Text style={styles.weightValue}>{weight} <Text style={styles.weightUnit}>kg</Text></Text>
              </TouchableOpacity>

            </View>
          </View>
        )}
      </ScrollView>

      {/* Daily Streak Modal */}
      <Modal
        visible={isStreakModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsStreakModalVisible(false)}
      >
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
                  <Image 
                    source={require('../../assets/images/fire.png')} 
                    style={styles.largeFireIcon} 
                    resizeMode="contain" 
                  />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textMuted,
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
    color: Colors.text,
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
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '500',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  checkboxActive: {
    backgroundColor: '#EF4444', 
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  weightUnit: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: 'normal',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.background,
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
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  closeText: {
    color: Colors.textMuted,
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
    color: Colors.text,
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
    color: Colors.textMuted,
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
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  largeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.border,
  }
});
