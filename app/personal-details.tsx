import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { Colors } from "../constants/Colors";
import { fetchUserPlan, updateUserPlan } from "../lib/tracking";

export default function PersonalDetails() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [water, setWater] = useState("");

  useEffect(() => {
    if (user) {
      loadPlan();
    }
  }, [user]);

  const loadPlan = async () => {
    try {
      const plan = await fetchUserPlan(user!.id);
      if (plan) {
        setCalories(plan.dailyCalories.toString());
        setProtein(plan.macros.proteinGrams.toString());
        setCarbs(plan.macros.carbsGrams.toString());
        setFat(plan.macros.fatsGrams.toString());
        setWater(plan.waterIntakeLiters.toString());
      }
    } catch (error) {
      console.error("Failed to load plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const newPlan = {
        dailyCalories: parseInt(calories) || 0,
        macros: {
          proteinGrams: parseInt(protein) || 0,
          carbsGrams: parseInt(carbs) || 0,
          fatsGrams: parseInt(fat) || 0,
        },
        waterIntakeLiters: parseFloat(water) || 0,
        fitnessSummary: "Plan manually updated by user.",
      };

      const success = await updateUserPlan(user.id, newPlan);
      if (success) {
        router.back();
      } else {
        alert("Failed to save changes. Please try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderInputCard = (
    icon: string,
    label: string,
    value: string,
    onChange: (val: string) => void,
    unit: string,
    placeholder: string
  ) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={icon as any} size={20} color={Colors.primary} />
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
        />
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.instructionText}>
            Customize your daily nutrition and hydration goals. These settings will be used to track your progress.
          </Text>

          {renderInputCard("flame-outline", "Daily Calories", calories, setCalories, "kcal", "2000")}
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              {renderInputCard("fitness-outline", "Protein", protein, setProtein, "g", "150")}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              {renderInputCard("nutrition-outline", "Carbs", carbs, setCarbs, "g", "250")}
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              {renderInputCard("leaf-outline", "Fat", fat, setFat, "g", "70")}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              {renderInputCard("water-outline", "Water", water, setWater, "L", "2.5")}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              isLoading={saving}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    padding: 0,
  },
  unitText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginLeft: 8,
    marginBottom: 4,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    marginTop: 24,
  },
  saveButton: {
    height: 60,
    borderRadius: 20,
  },
});
