export const toNumber = (value: string) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
};

export const formatDateTime = (value?: string) => {
  if (!value) return '刚刚';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '刚刚';
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
};

export const getMaintenanceTab = (type: string) => {
  const normalized = type.toUpperCase();
  if (normalized === 'FEEDING' || type.includes('喂')) return 'feed';
  if (normalized === 'WATER_CHANGE' || type.includes('换水')) return 'water-change';
  return 'maintenance';
};

export const getMaintenanceLabel = (type: string) => {
  const tab = getMaintenanceTab(type);
  if (tab === 'feed') return '喂食';
  if (tab === 'water-change') return '换水';
  return type || '维护';
};

export const compact = (values: Array<string | undefined>) => values.filter(Boolean).join('；');

export const midpoint = (min?: number, max?: number, fallback?: string) => {
  if (min === undefined || max === undefined) return fallback ?? '';
  return `${Number(((min + max) / 2).toFixed(1))}`;
};
