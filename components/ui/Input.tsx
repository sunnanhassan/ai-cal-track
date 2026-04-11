import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: any; 
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input = ({
  label,
  error,
  icon: Icon,
  isPassword,
  style,
  containerStyle,
  ...props
}: InputProps) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error ? styles.inputContainerError : null,
          containerStyle,
        ]}
      >
        {Icon && (
          <View style={styles.icon}>
            <Icon
              size={20}
              color={
                error
                  ? '#EF4444'
                  : isFocused
                    ? colors.primary
                    : colors.textMuted
              }
            />
          </View>
        )}
        
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 56,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
