import React from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Vitality } from '../../constants/Colors';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  cornerRadius?: number;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 24,
  cornerRadius = 24,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, { borderRadius: cornerRadius }, style]} {...props}>
      <View style={styles.innerContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Vitality.glass,
    overflow: 'hidden',
    // Minimal border shift as per "No-Line" rule
    borderWidth: 1,
    borderColor: Vitality.glassBorder,
  },
  blur: {
    flex: 1,
  },
  innerContent: {
    // Padding is handled by the parent components for flexibility
  },
});

export default GlassCard;
