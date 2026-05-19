import { create } from 'zustand';
import { api, Aquarium } from '../services/api';

interface AquariumState {
  aquariums: Aquarium[];
  selectedId?: string;
  loading: boolean;
  loadAquariums: () => Promise<void>;
  select: (id: string) => void;
}

export const useAquariumStore = create<AquariumState>((set) => ({
  aquariums: [],
  selectedId: undefined,
  loading: false,

  async loadAquariums() {
    set({ loading: true });
    try {
      const aquariums = await api.listAquariums();
      const currentSelectedId = useAquariumStore.getState().selectedId;
      const nextSelectedId = aquariums.some((a) => a.id === currentSelectedId)
        ? currentSelectedId
        : aquariums[0]?.id;
      set({ aquariums, selectedId: nextSelectedId });
    } catch {
      set({ aquariums: [], selectedId: undefined });
    } finally {
      set({ loading: false });
    }
  },

  select(id) {
    set({ selectedId: id });
  },
}));
