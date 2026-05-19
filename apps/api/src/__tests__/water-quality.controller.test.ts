import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAuthenticatedUser } from '../test/test-helpers';
import { createAquarium, createWaterRecord } from '../test/fixtures';

describe('WaterQualityController', () => {
  let userId: string;
  let token: string;
  let aquariumId: string;

  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const app = await createTestApp();
    ({ userId, token } = await createAuthenticatedUser(app, getHttpServer()));

    const tankRes = await request(getHttpServer())
      .post('/api/aquariums')
      .set('Authorization', `Bearer ${token}`)
      .send(createAquarium(userId));
    aquariumId = tankRes.body.id;
  });

  it('GET /api/water-quality-records returns empty array initially', async () => {
    const res = await request(getHttpServer())
      .get('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/water-quality-records creates a water quality record', async () => {
    const payload = createWaterRecord(aquariumId);
    const res = await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      aquariumId,
      temperature: 25.0,
      ph: 7.0,
      ammonia: 0,
      nitrite: 0,
      nitrate: 10,
      tds: 150,
    });
    expect(res.body.id).toBeDefined();
  });

  it('GET /api/water-quality-records returns records ordered by recordedAt desc', async () => {
    const base = createWaterRecord(aquariumId);

    await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...base, recordedAt: new Date('2026-01-01T10:00:00Z').toISOString() });

    await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...base, recordedAt: new Date('2026-01-03T10:00:00Z').toISOString() });

    await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...base, recordedAt: new Date('2026-01-02T10:00:00Z').toISOString() });

    const res = await request(getHttpServer())
      .get('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    const dates = res.body.map((r: { recordedAt: string }) => new Date(r.recordedAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
    }
  });

  it('GET /api/water-quality-records?aquariumId=xxx filters by aquarium', async () => {
    const secondTankRes = await request(getHttpServer())
      .post('/api/aquariums')
      .set('Authorization', `Bearer ${token}`)
      .send(createAquarium(userId, { name: 'Second Tank' }));
    const secondAquariumId = secondTankRes.body.id;

    await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createWaterRecord(aquariumId));

    await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createWaterRecord(secondAquariumId));

    const res = await request(getHttpServer())
      .get('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .query({ aquariumId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].aquariumId).toBe(aquariumId);
  });

  it('PATCH /api/water-quality-records/:id updates a field', async () => {
    const createRes = await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createWaterRecord(aquariumId));
    const recordId = createRes.body.id;

    const patchRes = await request(getHttpServer())
      .patch(`/api/water-quality-records/${recordId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ temperature: 28.5 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.temperature).toBe(28.5);
    expect(patchRes.body.ph).toBe(7.0);
  });

  it('DELETE /api/water-quality-records/:id removes the record', async () => {
    const createRes = await request(getHttpServer())
      .post('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createWaterRecord(aquariumId));
    const recordId = createRes.body.id;

    const deleteRes = await request(getHttpServer())
      .delete(`/api/water-quality-records/${recordId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    const listRes = await request(getHttpServer())
      .get('/api/water-quality-records')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.body).toHaveLength(0);
  });
});
