import { Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SideMenu } from '../../components/ui/SideMenu';
import { Vitality } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: Vitality.background }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="log-exercise" />
        <Stack.Screen name="log-exercise-details" />
        <Stack.Screen name="log-exercise-manual" />
        <Stack.Screen name="log-exercise-result" />
        <Stack.Screen name="log-water" />
        <Stack.Screen name="log-food" />
        <Stack.Screen name="log-food-details" />
        <Stack.Screen name="log-food-scan" />
      </Stack>

      {/* Global Pro Side Menu Overlay */}
      <SideMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Vitality.background,
  },
});
