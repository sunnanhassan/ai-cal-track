import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

export interface AdminNotificationConfig {
  lunch: string;
  afternoon: string;
  dinner: string;
  encouragement: string;
  upgrade: string;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: any;
  dateStr: string;
}

const DEFAULT_CONFIG: AdminNotificationConfig = {
  lunch: "Don't forget to log your lunch! 🥗",
  afternoon: "Time for an afternoon snack? Log it now! 🍎",
  dinner: "How was dinner? Complete your logs for today. 🌙",
  encouragement: "Log your activity daily to reach your goals faster! 🚀",
  upgrade: "Unlock AI scanning and more with a Pro plan! ✨",
};

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // NOTE: Expo Go on Android SDK 53+ has issues with Push Tokens. 
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.extra?.projectId;
    if (!projectId) {
      console.warn('No Project ID found for push tokens');
      return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Push Token registered:', token);
    return token;
  } catch (e) {
    // We log a warning but don't fail, as local notifications still work without a token.
    console.warn('Could not get push token (likely Expo Go limitation):', e);
    return null;
  }
}

export async function sendImmediateTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification 🔔",
      body: "If you see this, notifications are working correctly!",
      data: { type: 'test' },
      sound: 'default',
    },
    trigger: null, // Send immediately
  });
}

export async function seedAdminConfig() {
  try {
    const configRef = doc(db, 'admin', 'notifications');
    const snap = await getDoc(configRef);
    if (!snap.exists()) {
      await setDoc(configRef, DEFAULT_CONFIG);
      console.log('Admin notification config seeded');
    }
  } catch (error) {
    console.error('Error seeding admin notification config:', error);
  }
}

async function fetchAdminConfig(): Promise<AdminNotificationConfig> {
  try {
    const configRef = doc(db, 'admin', 'notifications');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      return { ...DEFAULT_CONFIG, ...snap.data() } as AdminNotificationConfig;
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error fetching admin notification config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function logNotificationToHistory(userId: string, title: string, body: string, type: string) {
  try {
    const historyRef = collection(db, 'users', userId, 'notifications');
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    
    // Avoid duplicate logs for the same type on the same day if desired, 
    // but usually we want a record of every one.
    await addDoc(historyRef, {
      title,
      body,
      type,
      createdAt: serverTimestamp(),
      dateStr,
    });
  } catch (error) {
    console.error('Error logging notification to history:', error);
  }
}

export async function scheduleDailyReminders(userId: string, isSubscribed: boolean = false) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const config = await fetchAdminConfig();

  const dailyTriggers = [
    { title: "Log your Activity", body: config.lunch, type: 'lunch', hour: 13, minute: 30 },
    { title: "Log your Activity", body: config.afternoon, type: 'afternoon', hour: 16, minute: 30 },
    { title: "Complete your Log", body: config.dinner, type: 'dinner', hour: 20, minute: 30 },
    { 
      title: isSubscribed ? "Ready for your day?" : "Stay Consistent!", 
      body: isSubscribed ? config.encouragement : config.upgrade, 
      type: isSubscribed ? 'encouragement' : 'upgrade', 
      hour: isSubscribed ? 9 : 10, 
      minute: 0 
    },
  ];

  for (const t of dailyTriggers) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t.title,
        body: t.body,
        data: { type: t.type },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: t.hour,
        minute: t.minute,
      },
    });
    
    // Optional: Log that we scheduled it for today
    // Or we can log when the user actually receives it. 
    // The user requested "Save all user sent notification". 
    // Since they are automated, logging them here marks them as "sent by system".
  }

  console.log('Daily notifications scheduled successfully');
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All scheduled notifications cancelled');
}
