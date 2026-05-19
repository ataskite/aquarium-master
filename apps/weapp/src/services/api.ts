import Taro from '@tarojs/taro';

const baseUrl = process.env.TARO_APP_API_BASE_URL ?? 'http://localhost:3000';

export interface Aquarium {
  id: string;
  name: string;
  coverUrl?: string;
  volumeLiters?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  species?: string;
  status?: string;
  healthScore?: number;
  fishStocks?: AquariumStock[];
  devices?: AquariumDevice[];
  waterProfile?: WaterParameterProfile;
  feedingTemplates?: FeedingTemplate[];
  waterRecords?: WaterQualityRecord[];
  maintenanceRecords?: MaintenanceRecord[];
  reminders?: Reminder[];
}

export interface FishSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: string;
  origin?: string;
  careLevel?: string;
  temperament?: string;
  diet?: string;
  waterLayer?: string;
  minGroupSize?: number;
  minTankLiters?: number;
  adultSizeCm?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  phMin?: number;
  phMax?: number;
  hardness?: string;
  notes?: string;
  sourceUrls?: string;
}

export interface AquariumStock {
  id: string;
  aquariumId: string;
  speciesId?: string;
  quantity: number;
  displayName?: string;
  color?: string;
  note?: string;
  species?: FishSpecies;
}

export interface AquariumDevice {
  id: string;
  aquariumId: string;
  type: string;
  name: string;
  status: string;
  powerWatts?: number;
  flowRateLph?: number;
  schedule?: string;
  note?: string;
}

export interface WaterParameterProfile {
  id: string;
  aquariumId: string;
  temperatureMin?: number;
  temperatureMax?: number;
  phMin?: number;
  phMax?: number;
  ammoniaMax: number;
  nitriteMax: number;
  nitrateMax?: number;
  tdsMin?: number;
  tdsMax?: number;
  note?: string;
  sourceUrls?: string;
}

export interface FeedingTemplate {
  id: string;
  aquariumId: string;
  speciesId?: string;
  food: string;
  amount: string;
  frequency: string;
  note?: string;
  species?: FishSpecies;
}

export interface WaterQualityRecord {
  id?: string;
  aquariumId: string;
  temperature?: number;
  ph?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  tds?: number;
  note?: string;
  recordedAt?: string;
}

export interface MaintenanceRecord {
  id?: string;
  aquariumId: string;
  type: string;
  note?: string;
  imageUrl?: string;
  happenedAt?: string;
}

export interface Reminder {
  id: string;
  userId?: string;
  aquariumId?: string;
  title: string;
  note?: string;
  dueAt: string;
  repeatRule?: string;
  status: 'PENDING' | 'DONE';
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function request<T>(url: string, method: keyof Taro.request.Method = 'GET', data?: unknown): Promise<T> {
  const token = Taro.getStorageSync('auth_token');
  const header: Record<string, string> = {};
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }
  const response = await Taro.request<T>({
    url: `${baseUrl}/api${url}`,
    method,
    data,
    header,
  });
  if (response.statusCode === 401) {
    Taro.removeStorageSync('auth_token');
    Taro.removeStorageSync('auth_user');
    throw new Error('Unauthorized');
  }
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Request failed: ${response.statusCode}`);
  }
  return response.data;
}

export const api = {
  listAquariums: () => request<Aquarium[]>('/aquariums'),
  getAquarium: (id: string) => request<Aquarium>(`/aquariums/${id}`),
  createAquarium: (data: Partial<Aquarium>) => request<Aquarium>('/aquariums', 'POST', data),
  listWaterRecords: (aquariumId: string) => request<WaterQualityRecord[]>(`/water-quality-records?aquariumId=${aquariumId}`),
  createWaterRecord: (data: WaterQualityRecord) => request<WaterQualityRecord>('/water-quality-records', 'POST', data),
  listMaintenanceRecords: (aquariumId: string) => request<MaintenanceRecord[]>(`/maintenance-records?aquariumId=${aquariumId}`),
  createMaintenanceRecord: (data: MaintenanceRecord) => request<MaintenanceRecord>('/maintenance-records', 'POST', data),
  listReminders: (aquariumId?: string) => request<Reminder[]>(aquariumId ? `/reminders?aquariumId=${aquariumId}` : '/reminders'),
  createReminder: (data: { title: string; dueAt: string; note?: string; aquariumId?: string; repeatRule?: string }) => request<Reminder>('/reminders', 'POST', data),
  updateReminder: (id: string, data: Partial<Reminder>) => request<Reminder>(`/reminders/${id}`, 'PATCH', data),
  deleteReminder: (id: string) => request<Reminder>(`/reminders/${id}`, 'DELETE'),
  listKnowledge: () => request<KnowledgeArticle[]>('/knowledge'),
  chat: (messages: ChatMessage[] | string) => request<{ answer: string; provider: string }>('/ai/chat', 'POST', {
    messages: typeof messages === 'string' ? [{ role: 'user', content: messages }] : messages,
  }),
  login: (code: string, nickname?: string) => request('/auth/wechat-login', 'POST', { code, nickname }),

  // Aquarium CRUD
  updateAquarium: (id: string, data: Partial<Aquarium>) => request<Aquarium>(`/aquariums/${id}`, 'PATCH', data),
  deleteAquarium: (id: string) => request<Aquarium>(`/aquariums/${id}`, 'DELETE'),

  // Fish stocks
  listFishStocks: (aquariumId: string) => request<AquariumStock[]>(`/fish-stocks?aquariumId=${aquariumId}`),
  createFishStock: (data: { aquariumId: string; speciesId?: string; displayName?: string; quantity: number; color?: string; note?: string }) => request<AquariumStock>('/fish-stocks', 'POST', data),
  updateFishStock: (id: string, data: Partial<AquariumStock>) => request<AquariumStock>(`/fish-stocks/${id}`, 'PATCH', data),
  deleteFishStock: (id: string) => request<AquariumStock>(`/fish-stocks/${id}`, 'DELETE'),

  // Fish species
  searchFishSpecies: (q: string) => request<FishSpecies[]>(`/fish-species?q=${encodeURIComponent(q)}`),
  listFishSpecies: () => request<FishSpecies[]>('/fish-species'),

  // Devices
  listDevices: (aquariumId: string) => request<AquariumDevice[]>(`/devices?aquariumId=${aquariumId}`),
  createDevice: (data: { aquariumId: string; type: string; name: string; status?: string; powerWatts?: number; flowRateLph?: number; schedule?: string; note?: string }) => request<AquariumDevice>('/devices', 'POST', data),
  updateDevice: (id: string, data: Partial<AquariumDevice>) => request<AquariumDevice>(`/devices/${id}`, 'PATCH', data),
  deleteDevice: (id: string) => request<AquariumDevice>(`/devices/${id}`, 'DELETE'),
};
