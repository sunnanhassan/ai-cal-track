import { useUser } from "@clerk/clerk-expo";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

export default function Home() {
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}!</Text>
        <Text style={styles.subtitle}>Let's track your progress today.</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Your dashboard will appear here</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 4,
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
