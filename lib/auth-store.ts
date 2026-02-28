import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const onboardingEmitter = {
  listeners: new Map<string, Set<() => void>>(),
  addEventListener(event: string, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  },
  removeEventListener(event: string, callback: () => void) {
    const eventSet = this.listeners.get(event);
    if (eventSet) {
      eventSet.delete(callback);
      if (eventSet.size === 0) {
        this.listeners.delete(event);
      }
    }
  },
  dispatchEvent(event: string) {
    const eventSet = this.listeners.get(event);
    if (eventSet) {
      eventSet.forEach(cb => cb());
    }
  }
};

export const saveUserToFirestore = async (user: {
  id: string;
  email: string | undefined;
  firstName?: string | null;
  lastName?: string | null;
}): Promise<{ success: boolean; hasCompletedOnboarding: boolean }> => {
  try {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasCompletedOnboarding: false,
        createdAt: serverTimestamp(),
      });
      console.log('User saved to Firestore successfully');
      
      await AsyncStorage.setItem(`onboarding_${user.id}`, JSON.stringify(false));
      return { success: true, hasCompletedOnboarding: false };
    } else {
      console.log('User already exists in Firestore');
      const data = userSnap.data();
      const hasCompleted = data.hasCompletedOnboarding || false;
      
      await AsyncStorage.setItem(`onboarding_${user.id}`, JSON.stringify(hasCompleted));
      return { success: true, hasCompletedOnboarding: hasCompleted };
    }
  } catch (error) {
    console.error('Error saving/fetching user from Firestore:', error);
    return { success: false, hasCompletedOnboarding: false };
  }
};

export const completeOnboarding = async (userId: string, onboardingData: any, aiPlan?: any): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...onboardingData,
      generatedPlan: aiPlan || null,
      hasCompletedOnboarding: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await AsyncStorage.setItem(`onboarding_${userId}`, JSON.stringify(true));
    
    // Dispatch event so root layout can catch it immediately
    onboardingEmitter.dispatchEvent('onboardingCompleted');

    return true;
  } catch (error) {
    console.error('Error completing onboarding in Firestore:', error);
    return false;
  }
};

export const checkLocalOnboarding = async (userId: string): Promise<boolean | null> => {
  try {
    const value = await AsyncStorage.getItem(`onboarding_${userId}`);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch local onboarding data', e);
    return null;
  }
};
