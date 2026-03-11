import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, CalculatorIcon, Dumbbell02Icon, WorkoutRunIcon } from 'hugeicons-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function LogExercise() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={24} color={Colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Exercise</Text>
        {/* Placeholder view to balance the header flex space */}
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* Option 1: Run */}
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => router.push({
            pathname: '/(tabs)/log-exercise-details' as any,
            params: { title: 'Run', description: 'Running, Walking, Cycling etc' }
          })}
        >
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <WorkoutRunIcon size={28} color="#3B82F6" variant="stroke" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Run</Text>
            <Text style={styles.cardSubtitle}>Running, Walking, Cycling etc</Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Weight Lifting */}
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => router.push({
            pathname: '/(tabs)/log-exercise-details' as any,
            params: { title: 'Weight Lifting', description: 'Gym, Machine etc' }
          })}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <Dumbbell02Icon size={28} color="#EF4444" variant="stroke" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Weight Lifting</Text>
            <Text style={styles.cardSubtitle}>Gym, Machine etc</Text>
          </View>
        </TouchableOpacity>

        {/* Option 3: Manual */}
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/log-exercise-manual')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
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
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  }
});
