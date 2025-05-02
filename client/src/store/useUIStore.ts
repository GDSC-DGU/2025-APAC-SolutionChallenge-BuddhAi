import { create } from "zustand";

type UIState = {
  isGazeActive: boolean;
  isVoiceActive: boolean;
  isHelpActive: boolean;
  setGazeActive: (value: boolean) => void;
  setVoiceActive: (value: boolean) => void;
  setHelpActive: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isGazeActive: false,
  isVoiceActive: false,
  isHelpActive: false,
  setGazeActive: (value) => set({ isGazeActive: value }),
  setVoiceActive: (value) => set({ isVoiceActive: value }),
  setHelpActive: (value) => set({ isHelpActive: value }),
}));
