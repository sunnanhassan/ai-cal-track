import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, CalculatorIcon, Dumbbell02Icon, WorkoutRunIcon } from 'hugeicons-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function LogExercise() {
  const router = useRouter();
  const { colors, theme: activeTheme } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDark = activeTheme === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={24} color={colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Exercise</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => router.push({
            pathname: '/(tabs)/log-exercise-details' as any,
            params: { title: 'Run', description: 'Running, Walking, Cycling etc' }
          })}
        >
          <View style={[styles.iconBox, { backgroundColor: isDark ? '#3B82F620' : '#DBEAFE' }]}>
            <WorkoutRunIcon size={28} color="#3B82F6" variant="stroke" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Run</Text>
            <Text style={styles.cardSubtitle}>Running, Walking, Cycling etc</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => router.push({
            pathname: '/(tabs)/log-exercise-details' as any,
            params: { title: 'Weight Lifting', description: 'Gym, Machine etc' }
          })}
        >
          <View style={[styles.iconBox, { backgroundColor: isDark ? '#EF444420' : '#FEE2E2' }]}>
            <Dumbbell02Icon size={28} color="#EF4444" variant="stroke" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Weight Lifting</Text>
            <Text style={styles.cardSubtitle}>Gym, Machine etc</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/log-exercise-manual')}
        >
          <View style={[styles.iconBox, { backgroundColor: isDark ? '#A855F720' : '#F3E8FF' }]}>
            <CalculatorIcon size={28} color="#A855F7" variant="stroke" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Manual</Text>
            <Text style={styles.cardSubtitle}>Enter calories burned manually</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  }
});
