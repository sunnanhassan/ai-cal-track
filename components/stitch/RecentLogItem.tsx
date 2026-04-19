import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Vitality } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RollingNumber } from './RollingNumber';

interface RecentLogItemProps {
  title: string;
  type: 'Food' | 'Exercise';
  time: string;
  calories: number;
  icon: string;
  iconBg: string;
  protein?: number;
  fat?: number;
  carbs?: number;
  targets?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  onPress?: () => void;
  onMorePress?: () => void;
  isEditing?: boolean;
  editValue?: string;
  onEditValueChange?: (val: string) => void;
  onSaveName?: () => void;
  onCancelEdit?: () => void;
  onPencilPress?: () => void;
}

import Animated, { FadeInUp } from 'react-native-reanimated';

const MetricCol = ({ 
  label, 
  value, 
  currentNum, 
  suffix = '', 
  percent, 
  color 
}: { 
  label: string; 
  value: string; 
  currentNum: number; 
  suffix?: string; 
  percent: number; 
  color: string 
}) => (
  <View style={styles.metricCol}>
    <Text style={styles.metricLabel}>{label}</Text>
    <RollingNumber value={currentNum} suffix={suffix} style={styles.metricMainValue} />
    <View style={styles.miniBarContainer}>
      <View style={[styles.miniBarFill, { width: `${Math.min(100, percent)}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.metricPercent}>{Math.round(percent)}%</Text>
  </View>
);

export const RecentLogItem: React.FC<RecentLogItemProps> = ({ 
  title, 
  type, 
  time, 
  calories, 
  icon, 
  iconBg,
  protein = 0,
  fat = 0,
  carbs = 0,
  targets,
  onPress,
  onMorePress,
  isEditing,
  editValue,
  onEditValueChange,
  onSaveName,
  onCancelEdit,
  onPencilPress
}) => {
  const isFood = type === 'Food';
  
  // Calculate % of daily goal if targets exist
  const calPercent = targets ? (calories / targets.calories) * 100 : 0;
  const carbPercent = targets ? (carbs / targets.carbs) * 100 : 0;
  const protPercent = targets ? (protein / targets.protein) * 100 : 0;
  const fatPercent = targets ? (fat / targets.fat) * 100 : 0;

  return (
    <Animated.View entering={FadeInUp.duration(400).springify()}>
      <TouchableOpacity 
        style={[styles.container, isFood && styles.detailedContainer, isEditing && styles.editingContainer]} 
        activeOpacity={isEditing ? 1 : 0.8}
        onPress={() => !isEditing && onPress?.()}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.leftSection}>
            <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
              <MaterialCommunityIcons name={icon as any} size={20} color={isEditing ? Vitality.primary : Vitality.text} />
            </View>
            <View style={styles.textContainer}>
              {isEditing ? (
                <View style={styles.editInputContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editValue}
                    onChangeText={onEditValueChange}
                    autoFocus
                    placeholder="Enter name..."
                    placeholderTextColor={Vitality.textMuted}
                    onSubmitEditing={onSaveName}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={onSaveName} style={styles.editActionBtn}>
                      <MaterialCommunityIcons name="check" size={20} color={Vitality.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onCancelEdit} style={styles.editActionBtn}>
                      <MaterialCommunityIcons name="close" size={20} color="#ff4d4d" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.title} numberOfLines={1}>{title}</Text>
                  <Text style={styles.subtitle}>{time}</Text>
                </>
              )}
            </View>
          </View>

          {!isEditing && (
            <View style={styles.headerRightButtons}>
              {isFood && (
                <TouchableOpacity 
                  style={styles.pencilButton} 
                  onPress={(e) => {
                    e.stopPropagation();
                    onPencilPress?.();
                  }}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={Vitality.textMuted} />
                </TouchableOpacity>
              )}
              {isFood && (
                <TouchableOpacity 
                  style={styles.moreButton} 
                  onPress={(e) => {
                    e.stopPropagation();
                    onMorePress?.();
                  }}
                >
                   <MaterialCommunityIcons name="dots-vertical" size={20} color={Vitality.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}


          {!isFood && !isEditing && (
            <View style={styles.rightSection}>
              <RollingNumber value={calories} style={styles.calories} />
              <Text style={styles.unit}>KCAL</Text>
            </View>
          )}
        </View>

        {isFood && (
          <>
            <View style={styles.divider} />
            <View style={styles.metricsRow}>
              <MetricCol label="Calories" value={`${calories}`} currentNum={calories} percent={calPercent} color={Vitality.primary} />
              <MetricCol label="Carbs" value={`${carbs}g`} currentNum={carbs} suffix="g" percent={carbPercent} color="#f0b429" />
              <MetricCol label="Protein" value={`${protein}g`} currentNum={protein} suffix="g" percent={protPercent} color="#667eea" />
              <MetricCol label="Fat" value={`${fat}g`} currentNum={fat} suffix="g" percent={fatPercent} color="#e4e1e9" />
            </View>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(89, 222, 155, 0.1)',
  },
  editingContainer: {
    backgroundColor: 'rgba(25, 25, 30, 0.98)',
    borderColor: Vitality.primary,
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pencilButton: {
    padding: 10,
    marginRight: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Vitality.text,
    paddingVertical: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: Vitality.primary,
    marginRight: 12,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editActionBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginLeft: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Vitality.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Vitality.textMuted,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 20,
    fontWeight: '800',
    color: Vitality.primary,
  },
  unit: {
    fontSize: 9,
    fontWeight: '700',
    color: Vitality.textMuted,
    marginTop: -2,
  },
  moreButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 11,
    color: Vitality.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricMainValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Vitality.text,
    marginBottom: 6,
  },
  miniBarContainer: {
    height: 3,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricPercent: {
    fontSize: 10,
    fontWeight: '600',
    color: Vitality.textMuted,
  },
});
