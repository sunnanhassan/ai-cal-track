import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { Colors } from "../../constants/Colors";

export interface SegmentedHalfCircleProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  value: number;
  label: string;
  segments: number;
  gapAngle: number;
}

export const SegmentedHalfCircleProgress30: React.FC<SegmentedHalfCircleProgressProps> = ({
  progress,
  size,
  strokeWidth,
  value,
  label,
  segments,
  gapAngle,
}) => {
  const activeSegments = Math.round(progress * segments);
  
  const cx = size / 2;
  const cy = size / 2; 

  // Safely interpret gapAngle. If gapAngle is too massive to fit inside 180 degrees, cap it.
  // We Ensure at least 1.5 degrees is given to the segment itself so they don't disappear into 0 width lines.
  const MAX_GAP = (180 - (segments * 1.5)) / (segments - 1);
  const safeGapAngle = Math.min(gapAngle, MAX_GAP);

  const totalGapAngle = safeGapAngle * (segments - 1);
  const totalSegmentAngle = 180 - totalGapAngle;
  const segmentAngle = totalSegmentAngle / segments;

  const midRadius = (size - strokeWidth) / 2;
  const arcLength = (segmentAngle / 180) * Math.PI * midRadius;

  return (
    <View style={{ width: size, height: size / 2, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
      <Svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
        {Array.from({ length: segments }).map((_, i) => {
          // 0 is left, 180 is right. We step clockwise.
          const angle = i * (segmentAngle + safeGapAngle);
          const isActive = i < activeSegments;

          return (
            <G key={i} rotation={angle} origin={`${cx}, ${cy}`}>
              <Path
                d={`M 0 ${cy} L ${strokeWidth} ${cy}`}
                stroke={isActive ? Colors.primary : Colors.border}
                strokeWidth={arcLength}
                strokeLinecap="butt"
              />
            </G>
          );
        })}
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    position: 'absolute',
    bottom: 5,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1,
    marginBottom: -4,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  }
});

export default SegmentedHalfCircleProgress30;
