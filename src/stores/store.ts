import { create } from 'zustand';
import { SetState } from 'zustand';

interface Store {
  content: string | null;
  setContent: (content: string) => void;
}

export const useStore = create<Store>((set: SetState<Store>) => ({
  content: null,
  setContent: (content: string) => set({ content }),
}));
