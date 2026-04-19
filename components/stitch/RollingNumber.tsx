import React, { useEffect } from 'react';
import { StyleSheet, TextInput, TextStyle } from 'react-native';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  Easing,
  useDerivedValue 
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Important: Whitelist 'text' prop to enable native animation on TextInput
Animated.addWhitelistedNativeProps({ text: true });

interface RollingNumberProps {
  value: number;
  style?: TextStyle;
  suffix?: string;
  precision?: number;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({ 
  value, 
  style, 
  suffix = '', 
  precision = 0 
}) => {
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${animatedValue.value.toFixed(precision)}${suffix}`,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      style={[styles.defaultStyle, style]}
      animatedProps={animatedProps}
      defaultValue={`${value.toFixed(precision)}${suffix}`}
    />
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    padding: 0,
    margin: 0,
    color: 'white',
  },
});
