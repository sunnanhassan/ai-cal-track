import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Dimensions, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { Vitality } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDateStore } from '../../lib/date-store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onClose }) => {
  const { selectedDate, setSelectedDate } = useDateStore();
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
      days.push({ id: `empty-${i}`, day: null });
    }
    // Days of month
    for (let i = 1; i <= lastDate; i++) {
      days.push({ id: `day-${i}`, day: i });
    }
    return days;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const monthYear = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  const days = getDaysInMonth(viewDate);

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const now = new Date();
    return (
      now.getDate() === day &&
      now.getMonth() === viewDate.getMonth() &&
      now.getFullYear() === viewDate.getFullYear()
    );
  };

  const isFuture = (day: number | null) => {
    if (!day) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Allow selecting today until end of day
    return date > now;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.container}>
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <View style={styles.calendarCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color={Vitality.text} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>{monthYear}</Text>
            
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color={Vitality.text} />
            </TouchableOpacity>
          </View>

          {/* Days Week Header */}
          <View style={styles.weekHeader}>
            {DAYS_OF_WEEK.map((day, idx) => (
              <Text key={idx} style={styles.weekLabel}>{day}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {days.map((item) => {
              const disabled = !item.day || isFuture(item.day);
              return (
                <TouchableOpacity
                  key={item.id}
                  disabled={disabled}
                  onPress={() => item.day && handleSelectDate(item.day)}
                  style={[
                    styles.dayCell,
                    isSelected(item.day) && styles.selectedCell,
                    disabled && item.day && { opacity: 0.25 }
                  ]}
                >
                  {item.day && (
                    <>
                      <Text style={[
                        styles.dayText,
                        isSelected(item.day) && styles.selectedText,
                        isToday(item.day) && !isSelected(item.day) && styles.todayText
                      ]}>
                        {item.day}
                      </Text>
                      {isToday(item.day) && !isSelected(item.day) && (
                        <View style={styles.todayIndicator} />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <TouchableOpacity 
            style={styles.todayButton} 
            onPress={() => {
              setSelectedDate(new Date());
              onClose();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          >
            <Text style={styles.todayButtonText}>JUMP TO TODAY</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  calendarCard: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: 'rgba(25, 25, 30, 0.95)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    color: Vitality.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekLabel: {
    width: (SCREEN_WIDTH * 0.9 - 48) / 7,
    textAlign: 'center',
    color: Vitality.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: (SCREEN_WIDTH * 0.9 - 48) / 7,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 12,
  },
  selectedCell: {
    backgroundColor: Vitality.primary,
  },
  dayText: {
    color: Vitality.text,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedText: {
    color: '#131318',
    fontWeight: '800',
  },
  todayText: {
    color: Vitality.primary,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Vitality.primary,
  },
  todayButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  todayButtonText: {
    color: Vitality.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
