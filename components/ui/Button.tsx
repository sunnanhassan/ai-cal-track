import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  textColor?: string;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  style,
  textStyle,
  icon,
  disabled,
  textColor,
  ...props
}: ButtonProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        isPrimary && styles.primaryBg,
        isSecondary && styles.secondaryBg,
        isOutline && styles.outlineBg,
        isGhost && styles.ghostBg,
        (isLoading || disabled) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? colors.background : colors.primary} />
      ) : (
        <>
          {icon && icon}
          <Text
            style={[
              styles.text,
              isPrimary && styles.primaryText,
              isSecondary && styles.secondaryText,
              isOutline && styles.outlineText,
              isGhost && styles.ghostText,
              icon ? { marginLeft: 8 } : {},
              textColor ? { color: textColor } : {},
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    marginVertical: 8,
  },
  primaryBg: {
    backgroundColor: colors.primary, 
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBg: {
    backgroundColor: colors.surface,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ghostBg: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: colors.background, 
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    color: colors.text,
  },
  ghostText: {
    color: colors.textMuted,
  },
});
