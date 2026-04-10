import { create } from 'zustand';

export interface SelectedFoodParsed {
  foodId: string;
  foodName: string;
  brandName?: string;
  servingSize: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  foodUrl?: string; // Original FatSecret link if needed
}

interface FoodStore {
  selectedFood: SelectedFoodParsed | null;
  scannedImageUri: string | null;
  scannedImageBase64: string | null;
  setSelectedFood: (food: SelectedFoodParsed | null) => void;
  setScannedImageUri: (uri: string | null) => void;
  setScannedImageBase64: (base64: string | null) => void;
}

export const useFoodStore = create<FoodStore>((set) => ({
  selectedFood: null,
  scannedImageUri: null,
  scannedImageBase64: null,
  setSelectedFood: (food) => set({ selectedFood: food }),
  setScannedImageUri: (uri) => set({ scannedImageUri: uri }),
  setScannedImageBase64: (base64) => set({ scannedImageBase64: base64 }),
}));

