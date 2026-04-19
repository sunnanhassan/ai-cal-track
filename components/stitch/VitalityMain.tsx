import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { DayProgress, DailyLog, addDailyLog, deleteDailyLog, saveToLibrary, updateLogName, calculateStreak } from '../../lib/tracking';
import { useMenuStore } from '../../lib/menu-store';
import { parseQuickLog } from '../../lib/gemini';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Keyboard, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';
import { WeeklyCalendar } from './WeeklyCalendar';
import { DailySnapshot } from './DailySnapshot';
import { HydrationCard } from './HydrationCard';
import { RecentLogItem } from './RecentLogItem';
import React, { useState, useEffect } from 'react';

import { useDateStore } from '../../lib/date-store';
import { CalendarModal } from './CalendarModal';

interface VitalityMainProps {
  progress: DayProgress;
  entries: DailyLog[];
  userProfile?: any;
  userId: string;
  onSearchPress?: () => void;
  onLogPress?: (item: DailyLog) => void;
}

const getLogIcon = (item: DailyLog) => {
  const name = item.name?.toLowerCase() || '';
  if (name.includes('apple') || name.includes('fruit')) return 'apple';
  if (name.includes('breakfast') || name.includes('yogurt') || name.includes('bowl')) return 'bowl-mix';
  if (item.burnedCalories && item.burnedCalories > 0) return 'run-fast';
  return 'food-fork-drink';
};

const getLogIconBg = (item: DailyLog) => {
  if (item.burnedCalories && item.burnedCalories > 0) return 'rgba(239, 68, 68, 0.1)';
  const name = item.name?.toLowerCase() || '';
  if (name.includes('apple') || name.includes('fruit')) return 'rgba(240, 180, 41, 0.1)';
  if (name.includes('breakfast') || name.includes('yogurt') || name.includes('bowl')) return 'rgba(102, 126, 234, 0.1)';
  return 'rgba(89, 222, 155, 0.1)';
};

export const VitalityMain: React.FC<VitalityMainProps> = ({ 
  progress, 
  entries, 
  userProfile,
  userId,
  onSearchPress,
  onLogPress 
}) => {
  const router = useRouter();
  const toggleMenu = useMenuStore((state) => state.toggleMenu);
  const { selectedDate, setSelectedDate } = useDateStore();
  
  const [query, setQuery] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [streak, setStreak] = useState(0);

  // Inline editing state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const fetchStreak = async () => {
      if (userId) {
        const streakData = await calculateStreak(userId);
        setStreak(streakData.current);
      }
    };
    fetchStreak();
  }, [userId]);

  const formattedDate = () => {
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString()) return 'Today';
    return selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleQuickLog = async () => {
    if (!query.trim() || !userId) return;
    
    Keyboard.dismiss();
    setIsLogging(true);
    try {
      // 1. Parse via AI
      const result = await parseQuickLog(query);
      if (result) {
        const success = await addDailyLog(userId, selectedDate, result);
        if (success) {
          setQuery('');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert("Error", "Failed to save log. Please try again.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to parse log. Try being more specific.");
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!selectedLog) return;
    
    Alert.alert(
      "Delete Log",
      "Are you sure you want to delete this entry? Your daily totals will be updated.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const success = await deleteDailyLog(userId, selectedDate, selectedLog.id, selectedLog);
            if (success) {
              setShowOptions(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        }
      ]
    );
  };

  const handleSaveToLibrary = async () => {
    if (!selectedLog) return;
    const { id, createdAt, ...logData } = selectedLog;
    const success = await saveToLibrary(userId, logData);
    if (success) {
      setShowOptions(false);
      Alert.alert("Saved", "This entry has been added to your library.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const startEditing = (log: DailyLog) => {
    setEditingLogId(log.id);
    setEditingName(log.name || '');
    setShowOptions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveEdit = async () => {
    if (!editingLogId || !userId) return;
    
    const logId = editingLogId;
    const newName = editingName;
    setEditingLogId(null);
    
    const success = await updateLogName(userId, selectedDate, logId, newName);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert("Error", "Failed to update name. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditingName('');
  };

  const openOptions = (log: DailyLog) => {
    setSelectedLog(log);
    setShowOptions(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Dynamic targets with professional fallbacks
  const targetCalories = userProfile?.dailyCalories || 2000;
  const targetProtein = userProfile?.targetProtein || 125;
  const targetFat = userProfile?.targetFats || 56;
  const targetCarbs = userProfile?.targetCarbs || 250;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleMenu}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={24} color={Vitality.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.todaySelector}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.todayText}>{formattedDate()}</Text>
            <Ionicons name="chevron-down" size={16} color={Vitality.primary} />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.energyBadge}
              onPress={() => router.push('/streak')}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={16} color={Vitality.primary} />
              <Text style={styles.energyText}>{streak}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Feather name="share-2" size={20} color={Vitality.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => setShowCalendar(true)}
            >
              <Feather name="calendar" size={20} color={Vitality.text} />
            </TouchableOpacity>
          </View>
        </View>

        <CalendarModal 
          visible={showCalendar} 
          onClose={() => setShowCalendar(false)} 
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <WeeklyCalendar />
          
          <DailySnapshot 
            foodCalories={progress.totalCalories}
            burnedCalories={progress.totalBurnedCalories}
            targetCalories={targetCalories}
            macros={{
              protein: { current: progress.totalProtein, total: targetProtein },
              fat: { current: progress.totalFat, total: targetFat },
              carbs: { current: progress.totalCarbs, total: targetCarbs }
            }}
            onPress={() => router.push('/day-view')}
          />
          
          {/* <HydrationCard amount={progress.totalWaterMl / 1000} goal={3} /> */}

          {/* Recent Logs Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logsList}>
            {entries.length > 0 ? (
              entries.map((item) => (
                <RecentLogItem 
                  key={item.id}
                  title={item.name || 'Unnamed Entry'}
                  type={item.burnedCalories ? 'Exercise' : 'Food'}
                  time={item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  calories={item.burnedCalories || item.calories}
                  protein={item.protein}
                  fat={item.fat}
                  carbs={item.carbs}
                  targets={{
                    calories: targetCalories,
                    protein: targetProtein,
                    fat: targetFat,
                    carbs: targetCarbs
                  }}
                  icon={getLogIcon(item)}
                  iconBg={getLogIconBg(item)}
                  onPress={() => {
                    if (!item.burnedCalories) {
                      router.push(`/food-detail?logId=${item.id}`);
                    }
                  }}
                  onMorePress={() => openOptions(item)}
                  isEditing={editingLogId === item.id}
                  editValue={editingName}
                  onEditValueChange={setEditingName}
                  onSaveName={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onPencilPress={() => startEditing(item)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No logs for today yet.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Search Bar */}
        <View style={styles.bottomBarContainer}>
           <View style={styles.searchBar}>
             <Feather name="search" size={20} color={Vitality.primary} style={styles.searchIcon} />
             <TextInput 
               style={styles.searchInput}
               placeholder="What did you eat or exercise?"
               placeholderTextColor={Vitality.textMuted}
               value={query}
               onChangeText={setQuery}
               onSubmitEditing={handleQuickLog}
               returnKeyType="done"
               editable={!isLogging}
             />
             {isLogging ? (
               <ActivityIndicator color={Vitality.primary} style={styles.loader} />
             ) : (
               <>
                 <TouchableOpacity style={styles.voiceButton}>
                   <Feather name="mic" size={20} color={Vitality.textMuted} />
                 </TouchableOpacity>
                 <View style={styles.cameraButton}>
                   <Feather name="camera" size={20} color={Vitality.text} />
                 </View>
               </>
             )}
           </View>
        </View>

        <Modal
          visible={showOptions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptions(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowOptions(false)}
          >
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>{selectedLog?.name || 'Log Options'}</Text>
              
              <TouchableOpacity style={styles.optionItem} onPress={() => startEditing(selectedLog!)}>
                <MaterialCommunityIcons name="pencil-outline" size={22} color={Vitality.text} />
                <Text style={styles.optionText}>Edit Entry</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem} onPress={() => { 
                setShowOptions(false); 
                if (selectedLog) {
                  router.push({
                    pathname: '/adjust-macros',
                    params: {
                      id: selectedLog.id,
                      name: selectedLog.name || '',
                      calories: selectedLog.calories,
                      protein: selectedLog.protein || 0,
                      fat: selectedLog.fat || 0,
                      carbs: selectedLog.carbs || 0,
                      burnedCalories: selectedLog.burnedCalories || 0
                    }
                  });
                }
              }}>
                <MaterialCommunityIcons name="tune" size={22} color={Vitality.text} />
                <Text style={styles.optionText}>Adjust Calories & Macros</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem} onPress={() => { setShowOptions(false); }}>
                <MaterialCommunityIcons name="clock-outline" size={22} color={Vitality.text} />
                <Text style={styles.optionText}>Change Date & Time</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem} onPress={handleSaveToLibrary}>
                <MaterialCommunityIcons name="bookmark-outline" size={22} color={Vitality.text} />
                <Text style={styles.optionText}>Add to Saved Entries</Text>
              </TouchableOpacity>

              <View style={styles.modalDivider} />

              <TouchableOpacity style={styles.optionItem} onPress={handleDeleteLog}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ff4d4d" />
                <Text style={[styles.optionText, { color: '#ff4d4d' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  todaySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayText: {
    fontSize: 18,
    fontWeight: '800',
    color: Vitality.primary,
    marginRight: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  energyText: {
    color: Vitality.text,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 4,
  },
  headerIcon: {
    marginLeft: 12,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Vitality.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Vitality.primary,
  },
  logsList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Vitality.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 19, 24, 0.9)', // Darker translucent
    borderWidth: 1.5,
    borderColor: 'rgba(89, 222, 155, 0.2)',
    borderRadius: 32,
    paddingHorizontal: 16,
    height: 64,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: Vitality.text,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 10,
  },
  loader: {
    marginLeft: 12,
  },
  voiceButton: {
    padding: 10,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(89, 222, 155, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(25, 25, 30, 0.98)', // Darker, cleaner finish
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Vitality.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: Vitality.text,
    marginLeft: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
});
