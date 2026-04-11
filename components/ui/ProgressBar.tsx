import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const { colors } = useTheme();
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.fill, { width: `${progressPercentage}%`, backgroundColor: colors.primary }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
