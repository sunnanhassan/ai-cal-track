import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useDateStore } from "../../lib/date-store";
import { useTheme } from "../../context/ThemeContext";

interface DateItem {
  date: Date;
  dayName: string; // e.g., "Mon"
  dayNumber: number; // e.g., 14
  isToday: boolean;
}

interface WeekItem {
  id: string;
  days: DateItem[];
}

// Generate past dates grouped into blocks of 7 days, ending on today.
const generateWeeks = (weeksCount: number): WeekItem[] => {
  const weeks: WeekItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // We loop from oldest week to current week (0)
  for (let i = weeksCount - 1; i >= 0; i--) {
    const days: DateItem[] = [];
    for (let j = 6; j >= 0; j--) {
      // For i=0 (current week), j goes 6 down to 0 (offset 6 to 0)
      const offset = (i * 7) + j;
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: offset === 0,
      });
    }
    weeks.push({
      id: `week-${i}`,
      days
    });
  }

  return weeks;
};

export default function Calendar() {
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const selectedDate = useDateStore((state) => state.selectedDate);
  const setSelectedDate = useDateStore((state) => state.setSelectedDate);
  const flatListRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  // Generate 4 weeks (28 days) into the past
  const PAST_WEEKS_COUNT = 4;

  useEffect(() => {
    const generated = generateWeeks(PAST_WEEKS_COUNT);
    setWeeks(generated);
    
    // Set initial selected date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);

    // Give it a moment to mount before scrolling to the extreme right (today's week)
    setTimeout(() => {
        if (flatListRef.current && generated.length > 0) {
            flatListRef.current.scrollToIndex({ index: generated.length - 1, animated: true });
        }
    }, 150);
  }, []);

  const monthYearLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    // You could emit this selected date to a parent component here
  };

  const renderWeek = ({ item }: { item: WeekItem }) => {
    // A week perfectly matches the screen width. We pad it so days sit nicely inside the edges.
    return (
      <View style={[styles.weekContainer, { width }]}>
        {item.days.map((day) => {
          const isSelected = day.date.getTime() === selectedDate.getTime();
          
          return (
            <TouchableOpacity 
              key={day.date.toISOString()}
              style={[
                styles.dateContainer,
                isSelected && styles.dateContainerSelected
              ]}
              onPress={() => handleSelectDate(day.date)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dayName,
                isSelected ? styles.dayNameSelected : (day.isToday ? styles.dayNameToday : null)
              ]}>
                {day.dayName}
              </Text>
              
              <View style={[
                styles.dayNumberCircle,
                isSelected && styles.dayNumberCircleSelected
              ]}>
                <Text style={[
                  styles.dayNumber,
                  isSelected ? styles.dayNumberSelected : (day.isToday ? styles.dayNumberToday : null)
                ]}>
                  {day.dayNumber}
                </Text>
              </View>
              
              {day.isToday && !isSelected && <View style={styles.todayIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Optional: Month Year Header reflecting the currently selected date */}
      <View style={styles.headerRow}>
        <Text style={styles.monthText}>{monthYearLabel}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={weeks}
        renderItem={renderWeek}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled // This natively snaps screen by screen (week by week) flawlessly
        getItemLayout={(data, index) => (
            {length: width, offset: width * index, index}
        )}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  headerRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Replaces list padding so centering is clean on every view
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44, // Strict container width to prevent squeezing
    height: 68,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent', // Make the basic circle look like the screenshot (dark, no border until selected)
  },
  dateContainerSelected: {
    backgroundColor: colors.primary, // Solid green pill background
    borderColor: colors.primary,
    borderWidth: 1.5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 4,
    marginTop: 2,
  },
  dayNameToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayNameSelected: {
    color: colors.textOnPrimary || '#FFFFFF', 
  },
  dayNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16, // Back to a perfect circle for neat spacing inside the pill
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberCircleSelected: {
    backgroundColor: 'transparent', // The parent container is already green, no need for inner fill
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  dayNumberToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: colors.textOnPrimary || '#FFFFFF',
    fontWeight: '800',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  }
});
