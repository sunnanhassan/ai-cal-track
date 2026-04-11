import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Calendar from "../../components/home/Calendar";
import CaloriesCard from "../../components/home/CaloriesCard";
import Header from "../../components/home/Header";
import RecentActivity from "../../components/home/RecentActivity";
import WaterCard from "../../components/home/WaterCard";
import { useTheme } from "../../context/ThemeContext";
import React, { useMemo } from "react";

export default function Home() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <Calendar />
        
        <View style={styles.content}>
          <CaloriesCard />
          <WaterCard />
          <RecentActivity />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  placeholderCard: {
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 24,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  }
});
