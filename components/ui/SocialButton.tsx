import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  iconType: 'google' | 'apple';
  isLoading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const SocialButton = ({
  title,
  onPress,
  iconType,
  isLoading,
  style,
  accessibilityLabel,
}: SocialButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator color="#F8FAFC" />
      ) : (
        <>
          {iconType === 'google' ? (
            <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.icon} />
          ) : (
            <Ionicons name="logo-apple" size={22} color="#F8FAFC" style={styles.icon} />
          )}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    marginVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
});
