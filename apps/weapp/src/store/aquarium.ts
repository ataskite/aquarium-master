import { create } from 'zustand';
import { api, Aquarium } from '../services/api';

interface AquariumState {
  aquariums: Aquarium[];
  selectedId?: string;
  loading: boolean;
  loadAquariums: () => Promise<void>;
  select: (id: string) => void;
}

const demoAquariums: Aquarium[] = [
  {
    id: 'demo-living-room',
    name: '我的客厅鱼缸',
    volumeLiters: 84,
    species: '孔雀鱼、红绿灯、清道夫',
    status: 'RUNNING',
    healthScore: 92,
  },
];

export const useAquariumStore = create<AquariumState>((set) => ({
  aquariums: demoAquariums,
  selectedId: demoAquariums[0].id,
  loading: false,
  async loadAquariums() {
    set({ loading: true });
    try {
      const aquariums = await api.listAquariums();
      set({ aquariums: aquariums.length ? aquariums : demoAquariums, selectedId: aquariums[0]?.id ?? demoAquariums[0].id });
    } catch {
      set({ aquariums: demoAquariums, selectedId: demoAquariums[0].id });
    } finally {
      set({ loading: false });
    }
  },
  select(id) {
    set({ selectedId: id });
  },
}));
