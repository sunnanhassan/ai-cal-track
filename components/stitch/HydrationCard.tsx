import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Vitality } from '../../constants/Colors';
import { GlassCard } from './GlassCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HydrationCardProps {
  amount: number; // in liters
  goal: number; // expected total droplets is 5, but we can scale
}

export const HydrationCard: React.FC<HydrationCardProps> = ({ amount, goal }) => {
  // Logic: 5 droplets total. amount / goal * 5 = filled droplets.
  const droplets = [1, 2, 3, 4, 5];
  const filledCount = Math.floor((amount / goal) * 5);

  return (
    <GlassCard style={styles.container}>
      <View style={styles.textSection}>
        <Text style={styles.label}>HYDRATION</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{amount.toFixed(1)}</Text>
          <Text style={styles.unit}>Liters</Text>
        </View>
      </View>

      <View style={styles.dropletContainer}>
        {droplets.map((d, i) => (
          <MaterialCommunityIcons 
            key={i}
            name="water" 
            size={24} 
            color={i < filledCount ? Vitality.primary : 'rgba(255, 255, 255, 0.05)'} 
            style={styles.droplet}
          />
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 32,
  },
  textSection: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: Vitality.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: Vitality.primary,
    marginRight: 8,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    color: Vitality.textMuted,
  },
  dropletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  droplet: {
    marginLeft: 12,
  },
});
