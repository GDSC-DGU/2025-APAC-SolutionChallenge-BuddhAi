import { create } from 'zustand';

interface AudioStore {
  isRecording: boolean;
  setRecording: (value: boolean) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  isRecording: false,
  setRecording: (value) => set({ isRecording: value }),
}));
