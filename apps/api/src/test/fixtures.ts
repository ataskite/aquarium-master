export function createUser(overrides: Record<string, unknown> = {}) {
  return {
    openId: `test-openid-${Date.now()}`,
    nickname: 'Test User',
    ...overrides,
  };
}

export function createAquarium(userId: string, overrides: Record<string, unknown> = {}) {
  return {
    userId,
    name: `Test Tank ${Date.now()}`,
    volumeLiters: 60,
    status: 'RUNNING',
    healthScore: 90,
    ...overrides,
  };
}

export function createWaterRecord(aquariumId: string, overrides: Record<string, unknown> = {}) {
  return {
    aquariumId,
    temperature: 25.0,
    ph: 7.0,
    ammonia: 0,
    nitrite: 0,
    nitrate: 10,
    tds: 150,
    ...overrides,
  };
}

export function createMaintenanceRecord(aquariumId: string, overrides: Record<string, unknown> = {}) {
  return {
    aquariumId,
    type: 'WATER_CHANGE',
    note: 'Test maintenance',
    ...overrides,
  };
}

export function createReminder(userId: string, aquariumId: string, overrides: Record<string, unknown> = {}) {
  return {
    userId,
    aquariumId,
    title: `Test Reminder ${Date.now()}`,
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'PENDING',
    ...overrides,
  };
}
