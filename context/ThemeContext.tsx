import { useUser } from '@clerk/clerk-expo';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light } from '../constants/Colors';
import { db } from '../lib/firebase';

type ThemePreference = 'light' | 'dark' | 'system';
type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ActiveTheme;
  preference: ThemePreference;
  colors: typeof light;
  setTheme: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('dark');
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>('dark');

  useEffect(() => {
    if (!user) {
      setActiveTheme(systemScheme === 'light' ? 'light' : 'dark');
      return;
    }

    // Subscribe to user preferences in Firestore
    const userRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const pref = data.preferences?.theme || 'dark';
        setPreference(pref);
      }
    });

    return () => unsubscribe();
  }, [user, systemScheme]);

  useEffect(() => {
    if (preference === 'system') {
      setActiveTheme(systemScheme === 'light' ? 'light' : 'dark');
    } else {
      setActiveTheme(preference);
    }
  }, [preference, systemScheme]);

  const value = {
    theme: activeTheme,
    preference,
    colors: activeTheme === 'light' ? light : dark,
    setTheme: (pref: ThemePreference) => setPreference(pref),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
