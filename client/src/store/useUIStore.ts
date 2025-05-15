import { create } from 'zustand';

interface UIState {
  isGazeActive: boolean;
  isVoiceActive: boolean;
  isHelpActive: boolean;
  toggleGaze: () => void;
  toggleVoice: () => void;
  toggleHelp: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGazeActive: false,
  isVoiceActive: false,
  isHelpActive: false,
  toggleGaze: () => set((state) => ({ isGazeActive: !state.isGazeActive })),
  toggleVoice: () => set((state) => ({ isVoiceActive: !state.isVoiceActive })),
  toggleHelp: () => set((state) => ({ isHelpActive: !state.isHelpActive })),
}));
