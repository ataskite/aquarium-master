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
    id: 'demo-aquarium-community',
    name: '南美小型灯鱼缸',
    volumeLiters: 84,
    lengthCm: 60,
    widthCm: 40,
    heightCm: 35,
    species: '红绿灯鱼 Paracheirodon innesi 12只、熊猫鼠 Corydoras panda 6只、小精灵 Otocinclus spp. 3只',
    status: 'RUNNING',
    healthScore: 94,
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
      const nextAquariums = aquariums.length ? aquariums : demoAquariums;
      const currentSelectedId = useAquariumStore.getState().selectedId;
      const nextSelectedId = nextAquariums.some((aquarium) => aquarium.id === currentSelectedId)
        ? currentSelectedId
        : nextAquariums[0].id;
      set({ aquariums: nextAquariums, selectedId: nextSelectedId });
    } catch {
      const currentSelectedId = useAquariumStore.getState().selectedId;
      const nextSelectedId = demoAquariums.some((aquarium) => aquarium.id === currentSelectedId)
        ? currentSelectedId
        : demoAquariums[0].id;
      set({ aquariums: demoAquariums, selectedId: nextSelectedId });
    } finally {
      set({ loading: false });
    }
  },
  select(id) {
    set({ selectedId: id });
  },
}));
