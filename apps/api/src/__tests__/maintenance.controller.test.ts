import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAuthenticatedUser } from '../test/test-helpers';
import { createAquarium, createMaintenanceRecord } from '../test/fixtures';

describe('MaintenanceController', () => {
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

  it('GET /api/maintenance-records returns empty array initially', async () => {
    const res = await request(getHttpServer())
      .get('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/maintenance-records creates a maintenance record', async () => {
    const payload = createMaintenanceRecord(aquariumId);
    const res = await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      aquariumId,
      type: 'WATER_CHANGE',
      note: 'Test maintenance',
    });
    expect(res.body.id).toBeDefined();
  });

  it('GET /api/maintenance-records returns records ordered by happenedAt desc', async () => {
    const base = createMaintenanceRecord(aquariumId);

    await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...base, happenedAt: new Date('2026-01-01T10:00:00Z').toISOString() });

    await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...base, happenedAt: new Date('2026-01-03T10:00:00Z').toISOString() });

    await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...base, happenedAt: new Date('2026-01-02T10:00:00Z').toISOString() });

    const res = await request(getHttpServer())
      .get('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    const dates = res.body.map((r: { happenedAt: string }) => new Date(r.happenedAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
    }
  });

  it('GET /api/maintenance-records?aquariumId=xxx filters by aquarium', async () => {
    const secondTankRes = await request(getHttpServer())
      .post('/api/aquariums')
      .set('Authorization', `Bearer ${token}`)
      .send(createAquarium(userId, { name: 'Second Tank' }));
    const secondAquariumId = secondTankRes.body.id;

    await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createMaintenanceRecord(aquariumId));

    await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createMaintenanceRecord(secondAquariumId));

    const res = await request(getHttpServer())
      .get('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .query({ aquariumId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].aquariumId).toBe(aquariumId);
  });

  it('PATCH /api/maintenance-records/:id updates note', async () => {
    const createRes = await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createMaintenanceRecord(aquariumId));
    const recordId = createRes.body.id;

    const patchRes = await request(getHttpServer())
      .patch(`/api/maintenance-records/${recordId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: 'Updated maintenance note' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.note).toBe('Updated maintenance note');
    expect(patchRes.body.type).toBe('WATER_CHANGE');
  });

  it('DELETE /api/maintenance-records/:id removes the record', async () => {
    const createRes = await request(getHttpServer())
      .post('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`)
      .send(createMaintenanceRecord(aquariumId));
    const recordId = createRes.body.id;

    const deleteRes = await request(getHttpServer())
      .delete(`/api/maintenance-records/${recordId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    const listRes = await request(getHttpServer())
      .get('/api/maintenance-records')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.body).toHaveLength(0);
  });
});
