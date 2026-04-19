import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, LinearGradient, Stop, Defs } from 'react-native-svg';
import { Vitality } from '../../constants/Colors';

interface MacroRingProps {
  size?: number;
  strokeWidth?: number;
  percentage: number;
  label: string;
}

export const MacroRing: React.FC<MacroRingProps> = ({
  size = 64,
  strokeWidth = 6,
  percentage,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justify: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Vitality.primary} />
            <Stop offset="100%" stopColor={Vitality.primaryContainer} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Vitality.outline}
          strokeWidth={strokeWidth}
          opacity={0.2}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringLabelContainer}>
        <Text style={styles.ringPercentageText}>{percentage}%</Text>
      </View>
    </View>
  );
};

interface ProgressBarProps {
  percentage: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, color = Vitality.primary }) => {
  return (
    <View style={styles.barContainer}>
      <View style={[styles.barBackground, { backgroundColor: Vitality.outline }]} />
      <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  ringLabelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentageText: {
    color: Vitality.text,
    fontSize: 10,
    fontWeight: '700',
  },
  barContainer: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  barBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
