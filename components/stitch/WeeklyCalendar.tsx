import React, { useState, useEffect, useRef } from 'react';
import { useDateStore } from '../../lib/date-store';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Vitality } from '../../constants/Colors';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GAP = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - (GAP * 6)) / 7;

interface DayData {
  date: Date;
  dayName: string;
  dayNum: string;
  isToday: boolean;
}

export const WeeklyCalendar: React.FC = () => {
  const [days, setDays] = useState<DayData[]>([]);
  const { selectedDate, setSelectedDate } = useDateStore();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Generate exactly 28 days (4 full weeks)
    const generatedDays: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      generatedDays.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNum: date.getDate().toString(),
        isToday: date.getTime() === today.getTime()
      });
    }
    setDays(generatedDays);

    // Initial scroll to end (today's week)
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 150);
  }, []);

  const handlePress = (day: DayData) => {
    setSelectedDate(new Date(day.date));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH - (HORIZONTAL_PADDING * 1)} // Snap one full 'page'
        snapToAlignment="start"
      >
        {days.map((day, index) => {
          const isSelected = day.date.getTime() === new Date(selectedDate).setHours(0,0,0,0);
          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => handlePress(day)}
              activeOpacity={0.7}
              style={[
                styles.dayCard, 
                isSelected && styles.activeDayCard,
                { width: ITEM_WIDTH }
              ]}
            >
              <Text style={[
                styles.dayName, 
                isSelected && styles.activeDayText
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.dayNum, 
                isSelected && styles.activeDayText
              ]}>
                {day.dayNum}
              </Text>
              {day.isToday && !isSelected && (
                <View style={[styles.todayDot, { bottom: 6 }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: GAP,
  },
  dayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 20,
  },
  activeDayCard: {
    backgroundColor: Vitality.primary + '20',
    borderWidth: 1.5,
    borderColor: Vitality.primary,
  },
  dayName: {
    fontSize: 9, // Slightly smaller to fit 7
    fontWeight: '700',
    color: Vitality.textMuted,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Vitality.text,
  },
  activeDayText: {
    color: Vitality.primary,
  },
  todayDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Vitality.primary,
    opacity: 0.6,
  },
});
