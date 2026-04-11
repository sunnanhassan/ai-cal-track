import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Calendar from "../../components/home/Calendar";
import CaloriesCard from "../../components/home/CaloriesCard";
import Header from "../../components/home/Header";
import RecentActivity from "../../components/home/RecentActivity";
import WaterCard from "../../components/home/WaterCard";
import { Colors } from "../../constants/Colors";

export default function Home() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  placeholderCard: {
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 24,
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  }
});
