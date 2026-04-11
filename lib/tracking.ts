import { doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface DailyLog {
  id: string; // usually timestamp or unique id
  name?: string;
  calories: number;
  burnedCalories?: number; // Added burned tracking
  duration?: number; // Added exercise duration
  intensity?: string; // Added exercise intensity
  workoutType?: string; // Added Run, Weight Lifting, etc.
  protein: number;
  fat: number;
  carbs: number;
  waterMl: number; // Water intake in ml
  createdAt: any;
}

export interface DayProgress {
  totalCalories: number;
  totalBurnedCalories: number; 
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalWaterMl: number; // Daily accumulated water
}

export const formatDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const fetchUserPlan = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.generatedPlan || null; 
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user plan', error);
    return null;
  }
};

export const updateUserPlan = async (userId: string, newPlan: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      generatedPlan: newPlan,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Failed to update user plan', error);
    return false;
  }
};

export const fetchDailyProgress = async (userId: string, date: Date): Promise<DayProgress> => {
  try {
    const dateStr = formatDateString(date);
    const logRef = doc(db, 'users', userId, 'daily_summaries', dateStr);
    const snap = await getDoc(logRef);
    
      if (snap.exists()) {
        const data = snap.data();
        return {
          totalCalories: data.totalCalories || 0,
          totalBurnedCalories: data.totalBurnedCalories || 0,
          totalProtein: data.totalProtein || 0,
          totalFat: data.totalFat || 0,
          totalCarbs: data.totalCarbs || 0,
          totalWaterMl: data.totalWaterMl || 0,
        };
      }
      
      return {
        totalCalories: 0,
        totalBurnedCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        totalWaterMl: 0,
      };
    } catch (error) {
      console.error('Failed to fetch daily progress', error);
      return { totalCalories: 0, totalBurnedCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalWaterMl: 0 };
    }
};

export const addDailyLog = async (userId: string, date: Date, log: Omit<DailyLog, 'id' | 'createdAt'>) => {
  try {
    const dateStr = formatDateString(date);
    
    // 1. We keep a simple summary document per day
    const summaryRef = doc(db, 'users', userId, 'daily_summaries', dateStr);
    const summarySnap = await getDoc(summaryRef);
    
    if (!summarySnap.exists()) {
      await setDoc(summaryRef, {
        totalCalories: log.calories || 0,
        totalBurnedCalories: log.burnedCalories || 0,
        totalProtein: log.protein || 0,
        totalFat: log.fat || 0,
        totalCarbs: log.carbs || 0,
        totalWaterMl: log.waterMl || 0,
        lastUpdated: serverTimestamp()
      });
    } else {
      await updateDoc(summaryRef, {
        totalCalories: increment(log.calories || 0),
        totalBurnedCalories: increment(log.burnedCalories || 0),
        totalProtein: increment(log.protein || 0),
        totalFat: increment(log.fat || 0),
        totalCarbs: increment(log.carbs || 0),
        totalWaterMl: increment(log.waterMl || 0),
        lastUpdated: serverTimestamp()
      });
    }

    // 2. We could optionally write the exact log entries to a subcollection
    const logId = Date.now().toString();
    const specificLogRef = doc(db, 'users', userId, 'daily_summaries', dateStr, 'entries', logId);
    await setDoc(specificLogRef, {
      ...log,
      id: logId,
      createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Failed to add daily log', error);
    return false;
  }
};

export const updateUserWeight = async (userId: string, weightKg: number) => {
  try {
    const dateStr = formatDateString(new Date());

    // 1. Update user collection
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      weight: weightKg,
      updatedAt: serverTimestamp()
    });

    // 2. Add to weight logs subcollection for graphing later
    const logId = Date.now().toString();
    const weightLogRef = doc(db, 'users', userId, 'weight_logs', logId);
    await setDoc(weightLogRef, {
      weight: weightKg,
      dateStr: dateStr,
      timestamp: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Failed to update user weight', error);
    return false;
  }
};

export const saveBentoInsights = async (userId: string, insights: any[]) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bentoInsights: {
        data: insights,
        lastGeneratedAt: new Date().toISOString()
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to save bento insights', error);
    return false;
  }
};

export const fetchCachedBentoInsights = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.bentoInsights || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch cached bento insights', error);
    return null;
  }
};
