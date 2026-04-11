import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { Colors } from "../constants/Colors";
import { db } from "../lib/firebase";

type ThemeType = "system" | "dark" | "light";

export default function Preferences() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [theme, setTheme] = useState<ThemeType>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const userRef = doc(db, "users", user!.id);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.preferences) {
          setTheme(data.preferences.theme || "light");
          setNotificationsEnabled(data.preferences.notificationsEnabled !== false);
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        preferences: {
          theme,
          notificationsEnabled,
        },
      });
      router.back();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderThemeOption = (id: ThemeType, label: string, icon: string) => {
    const isSelected = theme === id;
    return (
      <TouchableOpacity
        style={[styles.themeCard, isSelected && styles.themeCardActive]}
        onPress={() => setTheme(id)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={isSelected ? Colors.primary : Colors.textMuted}
        />
        <Text style={[styles.themeLabel, isSelected && styles.themeLabelActive]}>
          {label}
        </Text>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Theme Selection */}
        <Text style={styles.sectionTitle}>App Theme</Text>
        <View style={styles.themeGrid}>
          {renderThemeOption("light", "Light", "sunny-outline")}
          {renderThemeOption("dark", "Dark", "moon-outline")}
          {renderThemeOption("system", "System", "settings-outline")}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary + "15" }]}>
                <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Push Notifications</Text>
                <Text style={styles.rowSubtitle}>Get updates on your daily goals</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + "50" }}
              thumbColor={notificationsEnabled ? Colors.primary : "#f4f3f4"}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Save Preferences"
            onPress={handleSave}
            isLoading={saving}
            style={styles.saveButton}
          />
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  themeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  themeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    marginHorizontal: 4,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 24,
  },
  themeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "05",
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: 10,
  },
  themeLabelActive: {
    color: Colors.text,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
  },
  saveButton: {
    height: 60,
    borderRadius: 20,
  },
});
