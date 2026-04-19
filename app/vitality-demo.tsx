import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { VitalityMain } from '../components/stitch/VitalityMain';
import { MealAnalysis } from '../components/stitch/MealAnalysis';
import { VitalityDashboard } from '../components/stitch/VitalityDashboard';
import { Vitality } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VitalityDemo() {
  const [view, setView] = useState<'main' | 'meal' | 'goals'>('main');

  return (
    <View style={{ flex: 1, backgroundColor: Vitality.background }}>
      <SafeAreaView edges={['top']} style={styles.navContainer}>
        <View style={styles.nav}>
          <TouchableOpacity 
            onPress={() => setView('main')} 
            style={[styles.navItem, view === 'main' && styles.activeNavItem]}
          >
            <Text style={[styles.navText, view === 'main' && styles.activeNavText]}>Main</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setView('meal')} 
            style={[styles.navItem, view === 'meal' && styles.activeNavItem]}
          >
            <Text style={[styles.navText, view === 'meal' && styles.activeNavText]}>Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setView('goals')} 
            style={[styles.navItem, view === 'goals' && styles.activeNavItem]}
          >
            <Text style={[styles.navText, view === 'goals' && styles.activeNavText]}>Goals</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={{ flex: 1 }}>
        {view === 'main' && <VitalityMain />}
        {view === 'meal' && <MealAnalysis />}
        {view === 'goals' && <VitalityDashboard />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: Vitality.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  nav: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'center',
    gap: 12,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeNavItem: {
    backgroundColor: Vitality.primary,
  },
  navText: {
    color: Vitality.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  activeNavText: {
    color: '#000',
  },
});
