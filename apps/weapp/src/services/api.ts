import Taro from '@tarojs/taro';

const baseUrl = process.env.TARO_APP_API_BASE_URL ?? 'http://localhost:3000';

export interface Aquarium {
  id: string;
  name: string;
  coverUrl?: string;
  volumeLiters?: number;
  species?: string;
  status?: string;
  healthScore?: number;
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
}

async function request<T>(url: string, method: keyof Taro.request.Method = 'GET', data?: unknown): Promise<T> {
  const response = await Taro.request<T>({
    url: `${baseUrl}/api${url}`,
    method,
    data,
  });
  return response.data;
}

export const api = {
  listAquariums: () => request<Aquarium[]>('/aquariums'),
  getAquarium: (id: string) => request<Aquarium & { waterRecords: WaterQualityRecord[]; maintenanceRecords: unknown[]; reminders: unknown[] }>(`/aquariums/${id}`),
  createAquarium: (data: Partial<Aquarium>) => request<Aquarium>('/aquariums', 'POST', data),
  createWaterRecord: (data: WaterQualityRecord) => request<WaterQualityRecord>('/water-quality-records', 'POST', data),
  listReminders: () => request<Array<{ id: string; title: string; dueAt: string; status: string; note?: string }>>('/reminders'),
  createReminder: (data: { title: string; dueAt: string; note?: string }) => request('/reminders', 'POST', data),
  chat: (content: string) => request<{ answer: string; provider: string }>('/ai/chat', 'POST', { messages: [{ role: 'user', content }] }),
  login: (code: string) => request('/auth/wechat-login', 'POST', { code }),
};
