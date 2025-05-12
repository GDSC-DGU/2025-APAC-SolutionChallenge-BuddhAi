import { create } from 'zustand';

interface VoiceState {
  isVoiceActive: boolean;
  spokenText: string;
  toggleVoice: () => void;
  setSpokenText: (text: string) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isVoiceActive: false,
  spokenText: '',
  toggleVoice: () => set((state) => ({ isVoiceActive: !state.isVoiceActive })),
  setSpokenText: (text) => set({ spokenText: text }),
}));
