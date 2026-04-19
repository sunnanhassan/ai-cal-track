import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle, TextInput } from 'react-native';
import { Vitality } from '../../constants/Colors';
import { GlassCard } from '../stitch/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  vertical?: boolean;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  subtitle, 
  icon, 
  selected, 
  onPress,
  style,
  vertical
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={vertical ? { flex: 1 } : undefined}>
      <GlassCard style={[
        styles.card, 
        selected && styles.cardSelected,
        vertical && styles.cardVertical,
        style
      ]}>
        <View style={[styles.cardContent, vertical && styles.cardContentVertical]}>
          {icon && (
            <View style={[styles.iconContainer, vertical && styles.iconContainerVertical]}>
              {icon}
            </View>
          )}
          <View style={[styles.textContainer, vertical && styles.textContainerVertical]}>
            <Text style={[
              styles.cardTitle, 
              selected && styles.textSelected,
              vertical && styles.cardTitleVertical
            ]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[
                styles.cardSubtitle,
                vertical && styles.cardSubtitleVertical
              ]}>
                {subtitle}
              </Text>
            )}
          </View>
          {selected && !vertical && (
            <View style={styles.checkCircle}>
              <View style={styles.checkInner} />
            </View>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({ 
  title, 
  onPress, 
  disabled 
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.buttonContainer, disabled && styles.buttonDisabled]}
    >
      <LinearGradient
        colors={disabled ? ['#334155', '#334155'] : [Vitality.primary, Vitality.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const OnboardingScreenWrapper: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  continueTitle?: string;
  onContinue: () => void;
  continueDisabled?: boolean;
  headerRight?: React.ReactNode;
}> = ({ title, subtitle, children, continueTitle = 'Continue', onContinue, continueDisabled, headerRight }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.topSection}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>{title}</Text>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
        {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.middleSection}>
        {children}
      </View>
      
      <View style={styles.bottomSection}>
        <OnboardingButton 
          title={continueTitle} 
          onPress={onContinue} 
          disabled={continueDisabled} 
        />
      </View>
    </View>
  );
};

export const CompactUnitToggle: React.FC<{
  value: string;
  onSelect: (val: any) => void;
  options: { label: string, value: string }[]
}> = ({ value, onSelect, options }) => {
  return (
    <View style={styles.compactToggle}>
      {options.map((opt) => (
        <TouchableOpacity 
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={[styles.compactTab, value === opt.value && styles.compactTabActive]}
        >
          <Text style={[styles.compactText, value === opt.value && styles.compactTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const UnitSelector: React.FC<{
  value: string;
  onSelect: (val: any) => void;
  options: { label: string, value: string }[]
}> = ({ value, onSelect, options }) => {
  return (
    <View style={styles.unitContainer}>
      {options.map((opt) => (
        <TouchableOpacity 
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={[styles.unitTab, value === opt.value && styles.unitTabActive]}
        >
          <Text style={[styles.unitText, value === opt.value && styles.unitTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const StyledInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  keyboardType?: 'numeric' | 'default';
  suffix?: string;
  onSuffixPress?: () => void;
}> = ({ value, onChangeText, placeholder, label, keyboardType, suffix, onSuffixPress }) => {
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <GlassCard style={styles.inputCard}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.2)"
            keyboardType={keyboardType}
          />
          {suffix && (
            <TouchableOpacity 
              onPress={onSuffixPress} 
              disabled={!onSuffixPress}
              style={styles.suffixButton}
            >
              <Text style={styles.inputSuffix}>{suffix.toUpperCase()}</Text>
              {onSuffixPress && (
                <View style={styles.chevronContainer}>
                   <View style={styles.chevronDown} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  topSection: {
    marginBottom: 40,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Vitality.text,
    lineHeight: 40,
    marginBottom: 12,
  },
  screenSubtitle: {
    fontSize: 16,
    color: Vitality.textMuted,
    lineHeight: 24,
  },
  middleSection: {
    flex: 1,
  },
  bottomSection: {
    marginTop: 20,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Vitality.primary,
    backgroundColor: 'rgba(89, 222, 155, 0.05)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Vitality.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Vitality.textMuted,
  },
  textSelected: {
    color: Vitality.primary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Vitality.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Vitality.primary,
  },
  buttonContainer: {
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: Vitality.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#131318',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  unitContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginTop: 20,
  },
  unitTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  unitTabActive: {
    backgroundColor: Vitality.primary,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Vitality.textMuted,
  },
  unitTextActive: {
    color: '#131318',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Vitality.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: Vitality.text,
  },
  inputSuffix: {
    fontSize: 24,
    fontWeight: '700',
    color: Vitality.primary,
  },
  suffixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  chevronContainer: {
    marginLeft: 6,
    marginTop: 4,
  },
  chevronDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Vitality.primary,
  },
  cardVertical: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    flex: 1,
    minHeight: 120,
  },
  cardContentVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerVertical: {
    marginRight: 0,
    marginBottom: 12,
  },
  textContainerVertical: {
    alignItems: 'center',
  },
  cardTitleVertical: {
    textAlign: 'center',
    fontSize: 14,
  },
  cardSubtitleVertical: {
    textAlign: 'center',
    fontSize: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerRight: {
    marginLeft: 12,
    marginTop: 4,
  },
  compactToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 2,
  },
  compactTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  compactTabActive: {
    backgroundColor: Vitality.primary,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '700',
    color: Vitality.textMuted,
  },
  compactTextActive: {
    color: '#131318',
  },
});
