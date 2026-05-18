import { describe, expect, it } from 'vitest';
import {
  countFish,
  countPendingReminders,
  getAquariumDimensions,
  getLatestWaterSummary,
  listFishArchiveItems,
} from '../../utils/dashboard';
import type { Aquarium } from '../../services/api';

const aquariums: Aquarium[] = [
  {
    id: 'tank-a',
    name: '南美缸',
    volumeLiters: 84,
    lengthCm: 60,
    widthCm: 40,
    heightCm: 35,
    fishStocks: [
      {
        id: 'stock-a',
        aquariumId: 'tank-a',
        speciesId: 'neon',
        quantity: 12,
        displayName: '红绿灯',
        species: {
          id: 'neon',
          commonName: '霓虹脂鲤',
          scientificName: 'Paracheirodon innesi',
          category: '灯鱼',
          temperatureMin: 20,
          temperatureMax: 26,
          phMin: 5,
          phMax: 7.5,
        },
      },
    ],
    waterRecords: [{ aquariumId: 'tank-a', temperature: 25.6, ph: 6.8, nitrate: 10 }],
    reminders: [{ id: 'r1', title: '换水', dueAt: '2026-05-18T00:00:00.000Z', status: 'PENDING' }],
  },
  {
    id: 'tank-b',
    name: '虾缸',
    fishStocks: [
      {
        id: 'stock-b',
        aquariumId: 'tank-b',
        speciesId: 'shrimp',
        quantity: 20,
        species: {
          id: 'shrimp',
          commonName: '黑壳虾',
          scientificName: 'Neocaridina davidi',
          category: '虾',
        },
      },
    ],
    reminders: [{ id: 'r2', title: '投喂', dueAt: '2026-05-18T00:00:00.000Z', status: 'DONE' }],
  },
];

describe('dashboard helpers', () => {
  it('counts all stocked fish across aquariums', () => {
    expect(countFish(aquariums)).toBe(32);
  });

  it('counts only pending reminders across aquariums', () => {
    expect(countPendingReminders(aquariums)).toBe(1);
  });

  it('formats dimensions with volume when available', () => {
    expect(getAquariumDimensions(aquariums[0])).toBe('84L · 60×40×35cm');
  });

  it('uses fallback for missing dimensions', () => {
    expect(getAquariumDimensions(aquariums[1])).toBe('容量待补充 · 尺寸待补充');
  });

  it('summarizes latest water values', () => {
    expect(getLatestWaterSummary(aquariums[0])).toBe('25.6℃ · pH 6.8 · NO3 10');
  });

  it('returns fallback when no water record exists', () => {
    expect(getLatestWaterSummary(aquariums[1])).toBe('暂无水质记录');
  });

  it('flattens fish archive items with aquarium context', () => {
    expect(listFishArchiveItems(aquariums)).toEqual([
      expect.objectContaining({ aquariumId: 'tank-a', aquariumName: '南美缸', name: '红绿灯', quantity: 12 }),
      expect.objectContaining({ aquariumId: 'tank-b', aquariumName: '虾缸', name: '黑壳虾', quantity: 20 }),
    ]);
  });
});
