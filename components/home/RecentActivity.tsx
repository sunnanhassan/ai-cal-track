import { useUser } from '@clerk/clerk-expo';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ClipboardIcon, DropletIcon, FireIcon, Dumbbell02Icon, WorkoutRunIcon } from 'hugeicons-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useDateStore } from '../../lib/date-store';
import { db } from '../../lib/firebase';
import { DailyLog, formatDateString } from '../../lib/tracking';

export default function RecentActivity() {
  const { user } = useUser();
  const selectedDate = useDateStore(state => state.selectedDate);
  const [entries, setEntries] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    const dateStr = formatDateString(selectedDate);
    const entriesRef = collection(db, 'users', user.id, 'daily_summaries', dateStr, 'entries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: DailyLog[] = [];
      snapshot.forEach((doc) => {
        fetchedEntries.push({ id: doc.id, ...doc.data() } as DailyLog);
      });
      setEntries(fetchedEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id, selectedDate]);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconCircle}>
        <ClipboardIcon size={32} color={Colors.primary} variant="stroke" />
      </View>
      <Text style={styles.emptyTitle}>No Activity Yet</Text>
      <Text style={styles.emptySubtitle}>Log your meals or water intake to see them appear here.</Text>
    </View>
  );

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderEntry = (entry: DailyLog) => {
    const isWaterLog = entry.waterMl > 0 && entry.calories === 0 && entry.protein === 0 && entry.fat === 0 && entry.carbs === 0;
    const isExerciseLog = (entry.burnedCalories || 0) > 0;

    if (isExerciseLog) {
      const isRun = entry.workoutType?.toLowerCase().includes('run') || entry.workoutType?.toLowerCase().includes('cardio');
      const isWeights = entry.workoutType?.toLowerCase().includes('weight');

      return (
        <View key={entry.id} style={styles.entryCard}>
          <View style={[styles.entryIconWrapper, { backgroundColor: isRun ? '#DBEAFE' : '#FEE2E2' }]}>
            {isRun ? (
              <WorkoutRunIcon size={24} color="#3B82F6" variant="stroke" />
            ) : isWeights ? (
              <Dumbbell02Icon size={24} color="#EF4444" variant="stroke" />
            ) : (
              <FireIcon size={24} color="#EF4444" variant="stroke" />
            )}
          </View>
          
          <View style={styles.entryInfo}>
            <View style={styles.entryHeaderRow}>
              <Text style={styles.entryTitle}>
                {entry.name || 'Exercise'}
              </Text>
              <Text style={styles.entryTimeRow}>{formatTime(entry.createdAt)}</Text>
            </View>
            
            <View style={styles.exerciseMetricsRow}>
              <FireIcon size={14} color="#EF4444" variant="stroke" />
              <Text style={styles.exerciseCaloriesText}>{entry.burnedCalories} kcal</Text>
            </View>
            
            {(entry.intensity || entry.duration) && (
              <Text style={styles.entryDetails}>
                {entry.intensity ? `${entry.intensity} intensity` : ''}
                {entry.intensity && entry.duration ? ' • ' : ''}
                {entry.duration ? `${entry.duration} min` : ''}
              </Text>
            )}
          </View>
        </View>
      );
    }

    // Default Food/Water log UI
    return (
      <View key={entry.id} style={styles.entryCard}>
        <View style={[styles.entryIconWrapper, { backgroundColor: isWaterLog ? '#DBEAFE' : '#F0FDF4' }]}>
          {isWaterLog ? (
            <DropletIcon size={20} color="#3B82F6" variant="stroke" />
          ) : (
            <Text style={{ fontSize: 20 }}>🍽️</Text>
          )}
        </View>
        
        <View style={styles.entryInfo}>
          <Text style={styles.entryTitle}>
            {isWaterLog ? 'Water Logged' : (entry.name || 'Meal Logged')}
          </Text>
          <Text style={styles.entryDetails}>
             {isWaterLog ? `${entry.waterMl} ml` : `${entry.calories} kcal • P: ${entry.protein}g F: ${entry.fat}g C: ${entry.carbs}g`}
          </Text>
        </View>
        
        <Text style={styles.entryTime}>{formatTime(entry.createdAt)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : entries.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.listContainer}>
          {entries.map(renderEntry)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40, 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  listContainer: {
    gap: 12,
  },
  emptyStateContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  entryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  entryDetails: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  entryTime: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryTimeRow: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  exerciseMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  exerciseCaloriesText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  }
});
