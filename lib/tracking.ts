import { doc, getDoc, increment, serverTimestamp, setDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
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
  // Deep Metrics
  fiber?: number;
  sugar?: number;
  addedSugar?: number;
  sugarAlcohols?: number;
  sodium?: number; // mg
  cholesterol?: number; // mg
  potassium?: number; // mg
  calcium?: number; // mg
  iron?: number; // mg
  vitaminA?: number; // IU
  vitaminC?: number; // mg
  vitaminD?: number; // IU or mcg
  saturatedFat?: number;
  transFat?: number;
  polyunsaturatedFat?: number;
  monounsaturatedFat?: number;
  waterMl: number; // Water intake in ml
  healthAnalysis?: string; // Persistent AI insight
  createdAt: any;
}

export interface DayProgress {
  totalCalories: number;
  totalBurnedCalories: number; 
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalWaterMl: number; 
  // Deep Metrics Totals
  totalFiber: number;
  totalSugar: number;
  totalAddedSugar: number;
  totalSugarAlcohols: number;
  totalSodium: number;
  totalCholesterol: number;
  totalPotassium: number;
  totalCalcium: number;
  totalIron: number;
  totalVitaminA: number;
  totalVitaminC: number;
  totalVitaminD: number;
  totalSaturatedFat: number;
  totalTransFat: number;
  totalPolyunsaturatedFat: number;
  totalMonounsaturatedFat: number;
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
          // Deep Metrics
          totalFiber: data.totalFiber || 0,
          totalSugar: data.totalSugar || 0,
          totalAddedSugar: data.totalAddedSugar || 0,
          totalSugarAlcohols: data.totalSugarAlcohols || 0,
          totalSodium: data.totalSodium || 0,
          totalCholesterol: data.totalCholesterol || 0,
          totalPotassium: data.totalPotassium || 0,
          totalCalcium: data.totalCalcium || 0,
          totalIron: data.totalIron || 0,
          totalVitaminA: data.totalVitaminA || 0,
          totalVitaminC: data.totalVitaminC || 0,
          totalVitaminD: data.totalVitaminD || 0,
          totalSaturatedFat: data.totalSaturatedFat || 0,
          totalTransFat: data.totalTransFat || 0,
          totalPolyunsaturatedFat: data.totalPolyunsaturatedFat || 0,
          totalMonounsaturatedFat: data.totalMonounsaturatedFat || 0,
        };
      }
      
      return {
        totalCalories: 0, totalBurnedCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalWaterMl: 0,
        totalFiber: 0, totalSugar: 0, totalAddedSugar: 0, totalSugarAlcohols: 0,
        totalSodium: 0, totalCholesterol: 0, totalPotassium: 0, totalCalcium: 0, totalIron: 0,
        totalVitaminA: 0, totalVitaminC: 0, totalVitaminD: 0,
        totalSaturatedFat: 0, totalTransFat: 0, totalPolyunsaturatedFat: 0, totalMonounsaturatedFat: 0
      };
    } catch (error) {
      console.error('Failed to fetch daily progress', error);
      return { 
        totalCalories: 0, totalBurnedCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalWaterMl: 0,
        totalFiber: 0, totalSugar: 0, totalAddedSugar: 0, totalSugarAlcohols: 0, totalSodium: 0, totalCholesterol: 0, totalPotassium: 0,
        totalCalcium: 0, totalIron: 0, totalVitaminA: 0, totalVitaminC: 0, totalVitaminD: 0, totalSaturatedFat: 0, totalTransFat: 0,
        totalPolyunsaturatedFat: 0, totalMonounsaturatedFat: 0
      };
    }
};

export const addDailyLog = async (userId: string, date: Date, log: Omit<DailyLog, 'id' | 'createdAt'>) => {
  try {
    const dateStr = formatDateString(date);
    
    // 1. We keep a simple summary document per day
    const summaryRef = doc(db, 'users', userId, 'daily_summaries', dateStr);
    const summarySnap = await getDoc(summaryRef);
    
    const summaryData = {
      totalCalories: increment(log.calories || 0),
      totalBurnedCalories: increment(log.burnedCalories || 0),
      totalProtein: increment(log.protein || 0),
      totalFat: increment(log.fat || 0),
      totalCarbs: increment(log.carbs || 0),
      totalWaterMl: increment(log.waterMl || 0),
      // Deep Metrics
      totalFiber: increment(log.fiber || 0),
      totalSugar: increment(log.sugar || 0),
      totalAddedSugar: increment(log.addedSugar || 0),
      totalSugarAlcohols: increment(log.sugarAlcohols || 0),
      totalSodium: increment(log.sodium || 0),
      totalCholesterol: increment(log.cholesterol || 0),
      totalPotassium: increment(log.potassium || 0),
      totalCalcium: increment(log.calcium || 0),
      totalIron: increment(log.iron || 0),
      totalVitaminA: increment(log.vitaminA || 0),
      totalVitaminC: increment(log.vitaminC || 0),
      totalVitaminD: increment(log.vitaminD || 0),
      totalSaturatedFat: increment(log.saturatedFat || 0),
      totalTransFat: increment(log.transFat || 0),
      totalPolyunsaturatedFat: increment(log.polyunsaturatedFat || 0),
      totalMonounsaturatedFat: increment(log.monounsaturatedFat || 0),
      lastUpdated: serverTimestamp()
    };

    if (!summarySnap.exists()) {
      await setDoc(summaryRef, {
        totalCalories: log.calories || 0,
        totalBurnedCalories: log.burnedCalories || 0,
        totalProtein: log.protein || 0,
        totalFat: log.fat || 0,
        totalCarbs: log.carbs || 0,
        totalWaterMl: log.waterMl || 0,
        // Deep Metrics
        totalFiber: log.fiber || 0,
        totalSugar: log.sugar || 0,
        totalAddedSugar: log.addedSugar || 0,
        totalSugarAlcohols: log.sugarAlcohols || 0,
        totalSodium: log.sodium || 0,
        totalCholesterol: log.cholesterol || 0,
        totalPotassium: log.potassium || 0,
        totalCalcium: log.calcium || 0,
        totalIron: log.iron || 0,
        totalVitaminA: log.vitaminA || 0,
        totalVitaminC: log.vitaminC || 0,
        totalVitaminD: log.vitaminD || 0,
        totalSaturatedFat: log.saturatedFat || 0,
        totalTransFat: log.transFat || 0,
        totalPolyunsaturatedFat: log.polyunsaturatedFat || 0,
        totalMonounsaturatedFat: log.monounsaturatedFat || 0,
        lastUpdated: serverTimestamp()
      });
    } else {
      await updateDoc(summaryRef, summaryData);
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
export const fetchDailyEntries = async (userId: string, date: Date): Promise<DailyLog[]> => {
  try {
    const dateStr = formatDateString(date);
    const entriesRef = collection(db, 'users', userId, 'daily_summaries', dateStr, 'entries');
    const q = query(entriesRef);
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DailyLog[];
  } catch (error) {
    console.error('Failed to fetch daily entries', error);
    return [];
  }
};

export const deleteDailyLog = async (userId: string, date: Date, logId: string, logData: DailyLog) => {
  try {
    const dateStr = formatDateString(date);
    const summaryRef = doc(db, 'users', userId, 'daily_summaries', dateStr);
    const specificLogRef = doc(db, 'users', userId, 'daily_summaries', dateStr, 'entries', logId);

    // 1. Decrement the summary
    await updateDoc(summaryRef, {
      totalCalories: increment(-(logData.calories || 0)),
      totalBurnedCalories: increment(-(logData.burnedCalories || 0)),
      totalProtein: increment(-(logData.protein || 0)),
      totalFat: increment(-(logData.fat || 0)),
      totalCarbs: increment(-(logData.carbs || 0)),
      lastUpdated: serverTimestamp()
    });

    // 2. Delete the entry
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(specificLogRef);

    return true;
  } catch (error) {
    console.error('Failed to delete daily log', error);
    return false;
  }
};

export const saveToLibrary = async (userId: string, log: Omit<DailyLog, 'id' | 'createdAt'>) => {
  try {
    const savedRef = collection(db, 'users', userId, 'saved_entries');
    await setDoc(doc(savedRef), {
      ...log,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Failed to save to library', error);
    return false;
  }
};

export const updateLogName = async (userId: string, date: Date, logId: string, newName: string) => {
  try {
    const dateStr = formatDateString(date);
    const specificLogRef = doc(db, 'users', userId, 'daily_summaries', dateStr, 'entries', logId);
    await updateDoc(specificLogRef, {
      name: newName,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Failed to update log name', error);
    return false;
  }
};

export const updateLogMacros = async (userId: string, date: Date, logId: string, oldData: Partial<DailyLog>, newData: Partial<DailyLog>) => {
  try {
    const dateStr = formatDateString(date);
    const summaryRef = doc(db, 'users', userId, 'daily_summaries', dateStr);
    const specificLogRef = doc(db, 'users', userId, 'daily_summaries', dateStr, 'entries', logId);

    // 1. Calculate deltas
    const deltaCalories = (newData.calories || 0) - (oldData.calories || 0);
    const deltaBurned = (newData.burnedCalories || 0) - (oldData.burnedCalories || 0);
    const deltaProtein = (newData.protein || 0) - (oldData.protein || 0);
    const deltaFat = (newData.fat || 0) - (oldData.fat || 0);
    const deltaCarbs = (newData.carbs || 0) - (oldData.carbs || 0);

    // 2. Update the summary with increments/decrements
    await updateDoc(summaryRef, {
      totalCalories: increment(deltaCalories),
      totalBurnedCalories: increment(deltaBurned),
      totalProtein: increment(deltaProtein),
      totalFat: increment(deltaFat),
      totalCarbs: increment(deltaCarbs),
      lastUpdated: serverTimestamp()
    });

    // 3. Update the entry itself
    await updateDoc(specificLogRef, {
      ...newData,
      lastUpdated: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Failed to update log macros', error);
    return false;
  }
};
export const calculateStreak = async (userId: string) => {
  try {
    const summariesRef = collection(db, 'users', userId, 'daily_summaries');
    const snap = await getDocs(summariesRef);
    
    if (snap.empty) return { current: 0, longest: 0, loggedDays: [] };

    const loggedDates = snap.docs
      .map(doc => {
        const parts = doc.id.split('-').map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
      })
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let tempDate = new Date(today);
    
    // Check if user logged today or yesterday to continue current streak
    const latestDate = loggedDates[0];
    const diffDays = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      for (let i = 0; i < loggedDates.length; i++) {
        const d = loggedDates[i];
        const diff = Math.floor((tempDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) {
          currentStreak++;
          tempDate.setDate(tempDate.getDate() - 1);
        } else if (diff === 1) {
          // Check if we skipped today but logged yesterday
          if (i === 0) {
             // Started from yesterday
             currentStreak++;
             tempDate = new Date(d);
             tempDate.setDate(tempDate.getDate() - 1);
          } else {
             // Break in streak
             break;
          }
        } else {
          break;
        }
      }
    }

    // Longest Streak
    let longestStreak = 0;
    let currentLongest = 0;
    const sortedAsc = [...loggedDates].sort((a, b) => a.getTime() - b.getTime());
    
    for (let i = 0; i < sortedAsc.length; i++) {
      if (i === 0) {
        currentLongest = 1;
      } else {
        const diff = Math.floor((sortedAsc[i].getTime() - sortedAsc[i-1].getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentLongest++;
        } else {
          currentLongest = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentLongest);
    }

    return { 
      current: currentStreak, 
      longest: longestStreak,
      loggedDates: snap.docs.map(d => d.id)
    };
  } catch (error) {
    console.error('Streak calculation failed', error);
    return { current: 0, longest: 0, loggedDates: [] };
  }
};

export const fetchWeeklyMetrics = async (userId: string, targetCalories: number) => {
  try {
    const today = new Date();
    const last7Days: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7Days.push(formatDateString(d));
    }

    let totalCalories = 0;
    let daysWithData = 0;
    let totalUnderBudget = 0;

    for (const dateStr of last7Days) {
        const summaryRef = doc(db, 'users', userId, 'daily_summaries', dateStr);
        const snap = await getDoc(summaryRef);
        if (snap.exists()) {
            const data = snap.data();
            const dailyFood = data.totalCalories || 0;
            const dailyBurned = data.totalBurnedCalories || 0;
            const net = dailyFood - dailyBurned;
            
            totalCalories += dailyFood;
            daysWithData++;
            
            if (net < targetCalories) {
                totalUnderBudget += (targetCalories - net);
            }
        }
    }

    return {
        averageCalories: daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0,
        totalUnderBudget: Math.round(totalUnderBudget)
    };
  } catch (error) {
    console.error('Weekly metrics fetch failed', error);
    return { averageCalories: 0, totalUnderBudget: 0 };
  }
};
