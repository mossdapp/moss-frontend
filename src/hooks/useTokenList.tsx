import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  data: any[];
  set: (v: any[]) => void;
  addToken: (v: any) => void;
}

export const useTokenListStore = create<StoreState>()(
  persist(
    (set, get) => ({
      data: [],
      set: (v: string[]) => set({ data: v }),
      addToken: (v: string) => set({ data: [...get().data, v] })
    }),
    {
      name: 'token-list-storage' // name of the item in the storage (must be unique)
    }
  )
);
