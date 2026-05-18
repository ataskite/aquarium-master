import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/api', () => ({
  api: {
    listAquariums: vi.fn(),
  },
}));

import { api } from '../../services/api';

const mockedListAquariums = vi.mocked(api.listAquariums);

describe('useAquariumStore', () => {
  beforeEach(() => {
    vi.resetModules();
    mockedListAquariums.mockReset();
  });

  it('has demoAquariums as initial state', async () => {
    const { useAquariumStore } = await import('../../store/aquarium');
    const state = useAquariumStore.getState();
    expect(state.aquariums).toHaveLength(1);
    expect(state.aquariums[0].name).toBe('南美小型灯鱼缸');
    expect(state.selectedId).toBe('demo-aquarium-community');
    expect(state.loading).toBe(false);
  });

  it('loads aquariums from API on success', async () => {
    mockedListAquariums.mockResolvedValue([
      { id: 'tank-1', name: 'Test Tank' } as any,
      { id: 'tank-2', name: 'Another Tank' } as any,
    ]);
    const { useAquariumStore } = await import('../../store/aquarium');
    await useAquariumStore.getState().loadAquariums();
    const state = useAquariumStore.getState();
    expect(state.aquariums).toHaveLength(2);
    expect(state.aquariums[0].id).toBe('tank-1');
    expect(state.selectedId).toBe('tank-1');
    expect(state.loading).toBe(false);
  });

  it('keeps selectedId when the selected aquarium still exists after reload', async () => {
    mockedListAquariums.mockResolvedValue([
      { id: 'tank-1', name: 'Test Tank' } as any,
      { id: 'tank-2', name: 'Another Tank' } as any,
    ]);
    const { useAquariumStore } = await import('../../store/aquarium');
    useAquariumStore.getState().select('tank-2');
    await useAquariumStore.getState().loadAquariums();
    expect(useAquariumStore.getState().selectedId).toBe('tank-2');
  });

  it('falls back to demo when API returns empty array', async () => {
    mockedListAquariums.mockResolvedValue([]);
    const { useAquariumStore } = await import('../../store/aquarium');
    await useAquariumStore.getState().loadAquariums();
    const state = useAquariumStore.getState();
    expect(state.aquariums).toHaveLength(1);
    expect(state.aquariums[0].name).toBe('南美小型灯鱼缸');
  });

  it('falls back to demo when API throws', async () => {
    mockedListAquariums.mockRejectedValue(new Error('network error'));
    const { useAquariumStore } = await import('../../store/aquarium');
    await useAquariumStore.getState().loadAquariums();
    const state = useAquariumStore.getState();
    expect(state.aquariums).toHaveLength(1);
    expect(state.aquariums[0].name).toBe('南美小型灯鱼缸');
    expect(state.loading).toBe(false);
  });

  it('updates selectedId via select', async () => {
    const { useAquariumStore } = await import('../../store/aquarium');
    useAquariumStore.getState().select('new-id');
    expect(useAquariumStore.getState().selectedId).toBe('new-id');
  });
});
