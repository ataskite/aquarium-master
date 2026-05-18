import type { Aquarium, AquariumStock } from '../services/api';
import { stockHint, stockName } from './tank-detail';

export interface FishArchiveItem {
  id: string;
  aquariumId: string;
  aquariumName: string;
  name: string;
  quantity: number;
  hint: string;
  stock: AquariumStock;
}

export const countFish = (aquariums: Aquarium[]) => aquariums.reduce(
  (total, aquarium) => total + (aquarium.fishStocks ?? []).reduce((sum, stock) => sum + stock.quantity, 0),
  0,
);

export const countPendingReminders = (aquariums: Aquarium[]) => aquariums.reduce(
  (total, aquarium) => total + (aquarium.reminders ?? []).filter((reminder) => reminder.status !== 'DONE').length,
  0,
);

export const getAquariumDimensions = (aquarium: Aquarium) => {
  const volume = aquarium.volumeLiters ? `${aquarium.volumeLiters}L` : '容量待补充';
  const dimensions = aquarium.lengthCm && aquarium.widthCm && aquarium.heightCm
    ? `${aquarium.lengthCm}×${aquarium.widthCm}×${aquarium.heightCm}cm`
    : '尺寸待补充';
  return `${volume} · ${dimensions}`;
};

export const getLatestWaterSummary = (aquarium: Aquarium) => {
  const latest = aquarium.waterRecords?.[0];
  if (!latest) return '暂无水质记录';
  return [
    latest.temperature !== undefined ? `${latest.temperature}℃` : undefined,
    latest.ph !== undefined ? `pH ${latest.ph}` : undefined,
    latest.nitrate !== undefined ? `NO3 ${latest.nitrate}` : undefined,
  ].filter(Boolean).join(' · ') || '暂无水质记录';
};

export const listFishArchiveItems = (aquariums: Aquarium[]): FishArchiveItem[] => aquariums.flatMap((aquarium) => (
  aquarium.fishStocks ?? []
).map((stock) => ({
  id: stock.id,
  aquariumId: aquarium.id,
  aquariumName: aquarium.name,
  name: stockName(stock),
  quantity: stock.quantity,
  hint: stockHint(stock),
  stock,
})));

export const getTankFishSummary = (aquarium: Aquarium) => {
  const stocks = aquarium.fishStocks ?? [];
  if (stocks.length === 0) return '暂无鱼只档案';
  const preview = stocks.slice(0, 2).map((stock) => `${stockName(stock)} ${stock.quantity}只`).join('、');
  return stocks.length > 2 ? `${preview} 等 ${stocks.length} 类` : preview;
};
