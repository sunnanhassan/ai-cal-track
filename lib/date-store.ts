import { create } from 'zustand';

interface DateState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
