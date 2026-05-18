import type { AquariumDevice, AquariumStock, WaterParameterProfile, WaterQualityRecord } from '../services/api';

export const statusText: Record<string, string> = {
  RUNNING: '运行中',
  MAINTENANCE: '维护中',
  PAUSED: '暂停',
};

export const deviceTypeText: Record<string, string> = {
  FILTER: '过滤器',
  HEATER: '加热棒',
  LIGHT: '灯光',
  AIR_PUMP: '增氧泵',
  CO2: 'CO2',
};

export const deviceStatusText: Record<string, string> = {
  RUNNING: '正常',
  SCHEDULED: '定时',
  PAUSED: '暂停',
};

export const isInRange = (value: number | undefined, min?: number, max?: number) => {
  if (value === undefined) return true;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

export const isWaterNormal = (latest: WaterQualityRecord | undefined, profile: WaterParameterProfile | undefined) => {
  if (!latest || !profile) return true;
  return (
    isInRange(latest.temperature, profile.temperatureMin, profile.temperatureMax) &&
    isInRange(latest.ph, profile.phMin, profile.phMax) &&
    (latest.ammonia ?? 0) <= profile.ammoniaMax &&
    (latest.nitrite ?? 0) <= profile.nitriteMax &&
    (profile.nitrateMax === undefined || (latest.nitrate ?? 0) <= profile.nitrateMax)
  );
};

export const formatProfile = (profile?: WaterParameterProfile) => {
  if (!profile) return '暂无目标区间';
  const temperature = profile.temperatureMin !== undefined && profile.temperatureMax !== undefined
    ? `${profile.temperatureMin}-${profile.temperatureMax}℃`
    : '温度未设';
  const ph = profile.phMin !== undefined && profile.phMax !== undefined ? `pH ${profile.phMin}-${profile.phMax}` : 'pH 未设';
  return `${temperature} · ${ph}`;
};

export const stockName = (stock: AquariumStock) => stock.displayName ?? stock.species?.commonName ?? '鱼只';

export const stockHint = (stock: AquariumStock) => {
  const species = stock.species;
  if (!species) return stock.note ?? '';
  const temperature = species.temperatureMin !== undefined && species.temperatureMax !== undefined
    ? `${species.temperatureMin}-${species.temperatureMax}℃`
    : undefined;
  const ph = species.phMin !== undefined && species.phMax !== undefined ? `pH ${species.phMin}-${species.phMax}` : undefined;
  return [species.scientificName, temperature, ph].filter(Boolean).join(' · ');
};

export const deviceMeta = (device: AquariumDevice) => {
  if (device.schedule) return device.schedule;
  if (device.flowRateLph) return `${device.flowRateLph} L/h`;
  if (device.powerWatts) return `${device.powerWatts}W`;
  return device.note ?? '已配置';
};
