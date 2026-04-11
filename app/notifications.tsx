import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { 
  collection, 
  onSnapshot, 
  orderBy, 
  query,
  limit,
  deleteDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { db } from "../lib/firebase";
import { TransitionProps } from "react-native-reanimated";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: any;
  dateStr: string;
}

export default function Notifications() {
  const { user } = useUser();
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.id, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationItem[];
      setNotifications(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleClearAll = () => {
    if (!user || notifications.length === 0) return;

    Alert.alert(
      "Clear All",
      "Are you sure you want to clear all notification history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive", 
          onPress: async () => {
            try {
              const batch = writeBatch(db);
              const q = query(collection(db, "users", user.id, "notifications"));
              const snap = await getDocs(q);
              snap.docs.forEach((doc) => batch.delete(doc.ref));
              await batch.commit();
            } catch (error) {
              console.error("Error clearing notifications:", error);
            }
          } 
        }
      ]
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'lunch': return 'restaurant-outline';
      case 'afternoon': return 'cafe-outline';
      case 'dinner': return 'moon-outline';
      case 'upgrade': return 'sparkles-outline';
      case 'encouragement': return 'happy-outline';
      default: return 'notifications-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'lunch': return '#FFA726';
      case 'afternoon': return '#FF7043';
      case 'dinner': return '#5C6BC0';
      case 'upgrade': return colors.primary;
      case 'encouragement': return '#66BB6A';
      default: return colors.primary;
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const time = item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
    
    return (
      <View style={styles.notificationCard}>
        <View style={[styles.iconBox, { backgroundColor: getIconColor(item.type) + '15' }]}>
          <Ionicons name={getIcon(item.type) as any} size={22} color={getIconColor(item.type)} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTime}>{time}</Text>
          </View>
          <Text style={styles.cardBody}>{item.body}</Text>
        </View>
      </View>
    );
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {};
    notifications.forEach((n) => {
      const date = n.dateStr || 'Earlier';
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [notifications]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleClearAll} disabled={notifications.length === 0}>
          <Text style={[styles.clearText, notifications.length === 0 && { opacity: 0.5 }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>System reminders and updates will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {item[0] === new Date().toISOString().split('T')[0] ? 'Today' : 
                 item[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'Yesterday' : 
                 item[0]}
              </Text>
              {item[1].map((n) => (
                <View key={n.id}>{renderItem({ item: n })}</View>
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    width: 40,
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardBody: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
