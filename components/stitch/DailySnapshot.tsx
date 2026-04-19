import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Vitality } from '../../constants/Colors';
import { GlassCard } from './GlassCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Animated, { useAnimatedStyle, withSpring, FadeInUp, Layout } from 'react-native-reanimated';

interface ProgressBarProps {
  label: string;
  value: string;
  total: string;
  currentNum: number;
  progress: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, total, currentNum, progress, color }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${Math.min(100, progress * 100)}%`, { damping: 15 }),
    };
  }, [progress]);

  return (
    <View style={styles.macroItem}>
      <View style={styles.macroLabelRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RollingNumber value={currentNum} style={styles.macroValue} />
          <Text style={styles.macroValue}>/{total}</Text>
        </View>
      </View>
      <View style={styles.barContainer}>
        <View style={styles.barBackground} />
        <Animated.View style={[styles.barFill, { backgroundColor: color }, animatedStyle]} />
      </View>
    </View>
  );
};

import { RollingNumber } from './RollingNumber';
import { TouchableOpacity } from 'react-native';

interface DailySnapshotProps {
  foodCalories: number;
  burnedCalories: number;
  targetCalories: number;
  macros: {
    protein: { current: number; total: number };
    fat: { current: number; total: number };
    carbs: { current: number; total: number };
  };
  onPress?: () => void;
}

export const DailySnapshot: React.FC<DailySnapshotProps> = ({ 
  foodCalories, 
  burnedCalories, 
  targetCalories, 
  macros,
  onPress 
}) => {
  const remaining = Math.max(0, targetCalories - foodCalories + burnedCalories);
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={Vitality.primary} />
          <Text style={styles.headerTitle}>DAILY SNAPSHOT</Text>
        </View>

        <View style={styles.contentRow}>
          {/* Calories Column */}
          <View style={styles.caloriesColumn}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="fire" size={18} color={Vitality.primary} />
              <Text style={styles.colTitle}>Calories</Text>
            </View>
            
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Food</Text>
              <RollingNumber value={foodCalories} style={styles.metricValue} />
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Exercise</Text>
              <RollingNumber value={burnedCalories} style={styles.metricValue} />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.remainingRow}>
              <Text style={styles.remainingLabel}>REMAINING</Text>
              <RollingNumber 
                value={remaining} 
                style={styles.remainingValue}
              />
            </View>
          </View>

          <View style={styles.verticalDivider} />

          {/* Macros Column */}
          <View style={styles.macrosColumn}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="chart-donut" size={18} color={Vitality.primary} />
              <Text style={styles.colTitle}>Macros</Text>
            </View>

            <ProgressBar 
              label="Carbs" 
              value={`${macros.carbs.current}`} 
              total={`${macros.carbs.total}g`} 
              currentNum={macros.carbs.current}
              progress={macros.carbs.current / macros.carbs.total} 
              color="#f0b429" 
            />
            <ProgressBar 
              label="Protein" 
              value={`${macros.protein.current}`} 
              total={`${macros.protein.total}g`} 
              currentNum={macros.protein.current}
              progress={macros.protein.current / macros.protein.total} 
              color={Vitality.primary} 
            />
            <ProgressBar 
              label="Fat" 
              value={`${macros.fat.current}`} 
              total={`${macros.fat.total}g`} 
              currentNum={macros.fat.current}
              progress={macros.fat.current / macros.fat.total} 
              color="#e4e1e9" 
            />
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Vitality.text,
    marginLeft: 10,
    letterSpacing: 1,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caloriesColumn: {
    flex: 1,
    paddingRight: 20,
  },
  macrosColumn: {
    flex: 1.2,
    paddingLeft: 20,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  colTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Vitality.text,
    marginLeft: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: Vitality.textMuted,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Vitality.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
  },
  remainingRow: {
    marginTop: 4,
  },
  remainingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Vitality.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  remainingValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Vitality.primary,
  },
  macroItem: {
    marginBottom: 16,
  },
  macroLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 12,
    color: Vitality.textMuted,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 12,
    color: Vitality.textMuted,
    fontWeight: '600',
  },
  barContainer: {
    height: 6,
    width: '100%',
    position: 'relative',
  },
  barBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 3,
  },
});
