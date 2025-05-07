import { create } from 'zustand';

export const useVoiceStore = create<{
  isRecognizing: boolean;
  setIsRecognizing: (v: boolean) => void;
}>((set) => ({
  isRecognizing: false,
  setIsRecognizing: (v) => set({ isRecognizing: v }),
}));
