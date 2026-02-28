import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface OptionCardProps {
  label: string;
  subLabel?: string;
  icon?: any; // Component prop
  isSelected?: boolean;
  onPress: () => void;
}

export const OptionCard = ({ label, subLabel, icon: Icon, isSelected = false, onPress }: OptionCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {Icon && (
          <Icon
            size={24}
            color={isSelected ? Colors.background : Colors.text}
          />
        )}
        <View style={[styles.textContainer, Icon && styles.textWithIcon]}>
          <Text style={[styles.label, isSelected && styles.selectedText]}>{label}</Text>
          {subLabel && (
            <Text style={[styles.subLabel, isSelected && styles.selectedSubLabel]}>
              {subLabel}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 70,
    justifyContent: 'center',
  },
  selectedContainer: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  textWithIcon: {
    marginLeft: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  subLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  selectedText: {
    color: Colors.background,
  },
  selectedSubLabel: {
    color: 'rgba(15, 23, 42, 0.7)',
  },
});
