import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
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
import { useTheme } from "../context/ThemeContext";
import { db } from "../lib/firebase";
import { cancelAllNotifications, scheduleDailyReminders, sendImmediateTestNotification } from "../lib/notificationService";

type ThemeType = "system" | "dark" | "light";

export default function Preferences() {
  const { user } = useUser();
  const router = useRouter();
  const { colors, theme: activeTheme, preference: currentPref, setTheme: updateThemeInContext } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localTheme, setLocalTheme] = useState<ThemeType>(currentPref as ThemeType);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.id);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setNotificationsEnabled(data.preferences?.notificationsEnabled ?? true);
          setIsSubscribed(data.subscriptionStatus === 'premium' || data.isSubscribed === true);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.id);
      
      // 1. Update Firestore
      await updateDoc(userRef, {
        "preferences.theme": localTheme,
        "preferences.notificationsEnabled": notificationsEnabled,
      });

      // 2. Trigger Notification logic
      if (notificationsEnabled) {
        await scheduleDailyReminders(user.id, isSubscribed);
      } else {
        await cancelAllNotifications();
      }

      router.back();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderThemeOption = (id: ThemeType, label: string, icon: string) => {
    const isSelected = localTheme === id;
    return (
      <TouchableOpacity
        style={[styles.themeCard, isSelected && styles.themeCardActive]}
        onPress={() => {
          setLocalTheme(id);
          updateThemeInContext(id);
        }}
        activeOpacity={0.8}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={isSelected ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.themeLabel, isSelected && styles.themeLabelActive]}>
          {label}
        </Text>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>App Theme</Text>
        <View style={styles.themeGrid}>
          {renderThemeOption("light", "Light", "sunny-outline")}
          {renderThemeOption("dark", "Dark", "moon-outline")}
          {renderThemeOption("system", "System", "settings-outline")}
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Push Notifications</Text>
                <Text style={styles.rowSubtitle}>Get updates on your daily goals</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + "50" }}
              thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {notificationsEnabled && (
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={async () => {
              try {
                await sendImmediateTestNotification();
              } catch (e) {
                alert("Failed to send test notification");
              }
            }}
          >
            <Ionicons name="send-outline" size={16} color={colors.primary} />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        )}

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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    marginHorizontal: 4,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 24,
  },
  themeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "05",
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 10,
  },
  themeLabelActive: {
    color: colors.text,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    gap: 8,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    marginTop: 40,
  },
  saveButton: {
    height: 60,
    borderRadius: 20,
  },
});
