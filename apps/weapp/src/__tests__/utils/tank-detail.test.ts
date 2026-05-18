import { describe, it, expect } from 'vitest';
import {
  statusText,
  deviceTypeText,
  deviceStatusText,
  isInRange,
  isWaterNormal,
  formatProfile,
  stockName,
  stockHint,
  deviceMeta,
} from '../../utils/tank-detail';
import type { WaterQualityRecord, WaterParameterProfile, AquariumStock, AquariumDevice } from '../../services/api';

describe('isInRange', () => {
  it('returns true when value is undefined', () => {
    expect(isInRange(undefined, 0, 10)).toBe(true);
  });

  it('returns true when value equals min', () => {
    expect(isInRange(5, 5, 10)).toBe(true);
  });

  it('returns true when value equals max', () => {
    expect(isInRange(10, 5, 10)).toBe(true);
  });

  it('returns true when value is between min and max', () => {
    expect(isInRange(7, 5, 10)).toBe(true);
  });

  it('returns false when value is below min', () => {
    expect(isInRange(4, 5, 10)).toBe(false);
  });

  it('returns false when value is above max', () => {
    expect(isInRange(11, 5, 10)).toBe(false);
  });

  it('returns true when only min is set and value >= min', () => {
    expect(isInRange(6, 5, undefined)).toBe(true);
  });

  it('returns true when only max is set and value <= max', () => {
    expect(isInRange(9, undefined, 10)).toBe(true);
  });

  it('returns true when neither min nor max is set', () => {
    expect(isInRange(999, undefined, undefined)).toBe(true);
  });
});

describe('isWaterNormal', () => {
  it('returns true when latest is undefined', () => {
    expect(isWaterNormal(undefined, {} as WaterParameterProfile)).toBe(true);
  });

  it('returns true when profile is undefined', () => {
    expect(isWaterNormal({} as WaterQualityRecord, undefined)).toBe(true);
  });

  it('returns true when all params are within range', () => {
    const latest = { temperature: 25, ph: 7.0, ammonia: 0, nitrite: 0, nitrate: 10 } as WaterQualityRecord;
    const profile = { temperatureMin: 20, temperatureMax: 28, phMin: 6.5, phMax: 7.5, ammoniaMax: 0.5, nitriteMax: 0.5, nitrateMax: 20 } as WaterParameterProfile;
    expect(isWaterNormal(latest, profile)).toBe(true);
  });

  it('returns false when temperature is below min', () => {
    const latest = { temperature: 18, ph: 7.0, ammonia: 0, nitrite: 0, nitrate: 10 } as WaterQualityRecord;
    const profile = { temperatureMin: 20, temperatureMax: 28, phMin: 6.5, phMax: 7.5, ammoniaMax: 0.5, nitriteMax: 0.5, nitrateMax: 20 } as WaterParameterProfile;
    expect(isWaterNormal(latest, profile)).toBe(false);
  });

  it('returns false when temperature is above max', () => {
    const latest = { temperature: 30, ph: 7.0, ammonia: 0, nitrite: 0, nitrate: 10 } as WaterQualityRecord;
    const profile = { temperatureMin: 20, temperatureMax: 28, phMin: 6.5, phMax: 7.5, ammoniaMax: 0.5, nitriteMax: 0.5, nitrateMax: 20 } as WaterParameterProfile;
    expect(isWaterNormal(latest, profile)).toBe(false);
  });

  it('returns false when pH is out of range', () => {
    const latest = { temperature: 25, ph: 8.0, ammonia: 0, nitrite: 0, nitrate: 10 } as WaterQualityRecord;
    const profile = { temperatureMin: 20, temperatureMax: 28, phMin: 6.5, phMax: 7.5, ammoniaMax: 0.5, nitriteMax: 0.5, nitrateMax: 20 } as WaterParameterProfile;
    expect(isWaterNormal(latest, profile)).toBe(false);
  });

  it('returns false when ammonia exceeds max', () => {
    const latest = { temperature: 25, ph: 7.0, ammonia: 1.0, nitrite: 0, nitrate: 10 } as WaterQualityRecord;
    const profile = { temperatureMin: 20, temperatureMax: 28, phMin: 6.5, phMax: 7.5, ammoniaMax: 0, nitriteMax: 0.5, nitrateMax: 20 } as WaterParameterProfile;
    expect(isWaterNormal(latest, profile)).toBe(false);
  });

  it('returns false when nitrate exceeds max', () => {
    const latest = { temperature: 25, ph: 7.0, ammonia: 0, nitrite: 0, nitrate: 30 } as WaterQualityRecord;
    const profile = { temperatureMin: 20, temperatureMax: 28, phMin: 6.5, phMax: 7.5, ammoniaMax: 0, nitriteMax: 0, nitrateMax: 20 } as WaterParameterProfile;
    expect(isWaterNormal(latest, profile)).toBe(false);
  });

  it('passes when nitrateMax is undefined', () => {
    const latest = { temperature: 25, ph: 7.0, ammonia: 0, nitrite: 0, nitrate: 999 } as WaterQualityRecord;
    const profile = { temperatureMin: 20, temperatureMax: 28, phMin: 6.5, phMax: 7.5, ammoniaMax: 0, nitriteMax: 0 } as WaterParameterProfile;
    expect(isWaterNormal(latest, profile)).toBe(true);
  });
});

describe('formatProfile', () => {
  it('returns fallback when profile is undefined', () => {
    expect(formatProfile(undefined)).toBe('暂无目标区间');
  });

  it('returns formatted string with both ranges', () => {
    const profile = { temperatureMin: 22, temperatureMax: 26, phMin: 6.5, phMax: 7.5 } as WaterParameterProfile;
    expect(formatProfile(profile)).toBe('22-26℃ · pH 6.5-7.5');
  });

  it('returns temperature placeholder when missing', () => {
    const profile = { phMin: 6.5, phMax: 7.5 } as WaterParameterProfile;
    expect(formatProfile(profile)).toBe('温度未设 · pH 6.5-7.5');
  });

  it('returns pH placeholder when missing', () => {
    const profile = { temperatureMin: 22, temperatureMax: 26 } as WaterParameterProfile;
    expect(formatProfile(profile)).toBe('22-26℃ · pH 未设');
  });
});

describe('stockName', () => {
  it('returns displayName when set', () => {
    const stock = { displayName: '红绿灯鱼', species: { commonName: '霓虹脂鲤' } } as AquariumStock;
    expect(stockName(stock)).toBe('红绿灯鱼');
  });

  it('returns species.commonName when displayName is undefined', () => {
    const stock = { displayName: undefined, species: { commonName: '霓虹脂鲤' } } as unknown as AquariumStock;
    expect(stockName(stock)).toBe('霓虹脂鲤');
  });

  it('returns fallback when both are undefined', () => {
    const stock = { displayName: undefined, species: { commonName: undefined } } as unknown as AquariumStock;
    expect(stockName(stock)).toBe('鱼只');
  });
});

describe('stockHint', () => {
  it('returns note when species is undefined', () => {
    const stock = { note: 'test note' } as AquariumStock;
    expect(stockHint(stock)).toBe('test note');
  });

  it('returns scientific name with ranges', () => {
    const stock = {
      species: {
        scientificName: 'Paracheirodon innesi',
        temperatureMin: 20,
        temperatureMax: 26,
        phMin: 5.0,
        phMax: 7.5,
      },
    } as AquariumStock;
    expect(stockHint(stock)).toBe('Paracheirodon innesi · 20-26℃ · pH 5-7.5');
  });

  it('omits temperature when not set', () => {
    const stock = {
      species: {
        scientificName: 'Test fish',
        phMin: 6.0,
        phMax: 7.0,
      },
    } as AquariumStock;
    expect(stockHint(stock)).toBe('Test fish · pH 6-7');
  });

  it('omits pH when not set', () => {
    const stock = {
      species: {
        scientificName: 'Test fish',
        temperatureMin: 22,
        temperatureMax: 28,
      },
    } as AquariumStock;
    expect(stockHint(stock)).toBe('Test fish · 22-28℃');
  });

  it('returns only scientific name when no ranges', () => {
    const stock = {
      species: { scientificName: 'Test fish' },
    } as AquariumStock;
    expect(stockHint(stock)).toBe('Test fish');
  });
});

describe('deviceMeta', () => {
  it('returns schedule when set', () => {
    const device = { schedule: '10:00-18:00', flowRateLph: 600, powerWatts: 12 } as AquariumDevice;
    expect(deviceMeta(device)).toBe('10:00-18:00');
  });

  it('returns flowRate when no schedule', () => {
    const device = { flowRateLph: 600, powerWatts: 12 } as AquariumDevice;
    expect(deviceMeta(device)).toBe('600 L/h');
  });

  it('returns powerWatts when no schedule or flowRate', () => {
    const device = { powerWatts: 100 } as AquariumDevice;
    expect(deviceMeta(device)).toBe('100W');
  });

  it('returns note when nothing else', () => {
    const device = { note: '备用设备' } as AquariumDevice;
    expect(deviceMeta(device)).toBe('备用设备');
  });

  it('returns fallback when nothing is set', () => {
    const device = {} as AquariumDevice;
    expect(deviceMeta(device)).toBe('已配置');
  });
});

describe('statusText', () => {
  it('returns Chinese labels for known statuses', () => {
    expect(statusText['RUNNING']).toBe('运行中');
    expect(statusText['MAINTENANCE']).toBe('维护中');
    expect(statusText['PAUSED']).toBe('暂停');
  });

  it('returns undefined for unknown status', () => {
    expect(statusText['UNKNOWN']).toBeUndefined();
  });
});

describe('deviceTypeText', () => {
  it('returns Chinese labels for known types', () => {
    expect(deviceTypeText['FILTER']).toBe('过滤器');
    expect(deviceTypeText['HEATER']).toBe('加热棒');
    expect(deviceTypeText['LIGHT']).toBe('灯光');
    expect(deviceTypeText['AIR_PUMP']).toBe('增氧泵');
    expect(deviceTypeText['CO2']).toBe('CO2');
  });
});

describe('deviceStatusText', () => {
  it('returns Chinese labels for known statuses', () => {
    expect(deviceStatusText['RUNNING']).toBe('正常');
    expect(deviceStatusText['SCHEDULED']).toBe('定时');
    expect(deviceStatusText['PAUSED']).toBe('暂停');
  });
});
