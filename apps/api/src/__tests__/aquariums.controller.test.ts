import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAquarium } from '../test/fixtures';

async function createTestUser(code = 'aq-user-test') {
  const res = await request(getHttpServer())
    .post('/api/auth/wechat-login')
    .send({ code });
  return res.body.user;
}

describe('AquariumsController', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/aquariums', () => {
    it('returns empty array initially', async () => {
      const res = await request(getHttpServer()).get('/api/aquariums');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('returns array with the created aquarium including fishStocks, waterProfile, and reminders', async () => {
      const user = await createTestUser();
      const aquariumData = createAquarium(user.id);

      await request(getHttpServer())
        .post('/api/aquariums')
        .send(aquariumData);

      const res = await request(getHttpServer()).get('/api/aquariums');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      const aq = res.body[0];
      expect(aq.name).toBe(aquariumData.name);
      expect(aq.userId).toBe(user.id);
      expect(Array.isArray(aq.fishStocks)).toBe(true);
      expect(aq.waterProfile).toBeDefined();
      expect(Array.isArray(aq.reminders)).toBe(true);
    });

    it('filters by userId query parameter', async () => {
      const user1 = await createTestUser('filter-user-1');
      const user2 = await createTestUser('filter-user-2');

      await request(getHttpServer())
        .post('/api/aquariums')
        .send(createAquarium(user1.id));

      await request(getHttpServer())
        .post('/api/aquariums')
        .send(createAquarium(user2.id));

      const res = await request(getHttpServer())
        .get(`/api/aquariums?userId=${user1.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].userId).toBe(user1.id);
    });
  });

  describe('POST /api/aquariums', () => {
    it('creates an aquarium', async () => {
      const user = await createTestUser();
      const aquariumData = createAquarium(user.id);

      const res = await request(getHttpServer())
        .post('/api/aquariums')
        .send(aquariumData);

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe(aquariumData.name);
      expect(res.body.userId).toBe(user.id);
      expect(res.body.volumeLiters).toBe(aquariumData.volumeLiters);
    });
  });

  describe('GET /api/aquariums/:id', () => {
    it('returns full aquarium with all includes', async () => {
      const user = await createTestUser();
      const aquariumData = createAquarium(user.id);

      const createRes = await request(getHttpServer())
        .post('/api/aquariums')
        .send(aquariumData);
      const aquariumId = createRes.body.id;

      const res = await request(getHttpServer()).get(`/api/aquariums/${aquariumId}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(aquariumId);
      // Verify all included relations exist (as arrays or null)
      expect(Array.isArray(res.body.fishStocks)).toBe(true);
      expect(Array.isArray(res.body.devices)).toBe(true);
      // waterProfile is a one-to-one, may be null
      expect(res.body).toHaveProperty('waterProfile');
      expect(Array.isArray(res.body.feedingTemplates)).toBe(true);
      expect(Array.isArray(res.body.waterRecords)).toBe(true);
      expect(Array.isArray(res.body.maintenanceRecords)).toBe(true);
      expect(Array.isArray(res.body.reminders)).toBe(true);
    });

    it('returns null for non-existent id', async () => {
      const res = await request(getHttpServer()).get('/api/aquariums/non-existent-id');

      expect(res.status).toBe(200);
      // NestJS serializes null controller return values as an empty body
      // which supertest parses as {}
      expect(res.body).toEqual({});
    });
  });

  describe('PATCH /api/aquariums/:id', () => {
    it('updates name', async () => {
      const user = await createTestUser();
      const aquariumData = createAquarium(user.id);

      const createRes = await request(getHttpServer())
        .post('/api/aquariums')
        .send(aquariumData);
      const aquariumId = createRes.body.id;

      const res = await request(getHttpServer())
        .patch(`/api/aquariums/${aquariumId}`)
        .send({ name: 'Renamed Tank' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Renamed Tank');
    });
  });

  describe('DELETE /api/aquariums/:id', () => {
    it('removes the aquarium', async () => {
      const user = await createTestUser();
      const aquariumData = createAquarium(user.id);

      const createRes = await request(getHttpServer())
        .post('/api/aquariums')
        .send(aquariumData);
      const aquariumId = createRes.body.id;

      const deleteRes = await request(getHttpServer())
        .delete(`/api/aquariums/${aquariumId}`);

      expect(deleteRes.status).toBe(200);

      // Verify it is gone
      const getRes = await request(getHttpServer()).get(`/api/aquariums/${aquariumId}`);
      // NestJS serializes null controller return values as an empty body
      // which supertest parses as {}
      expect(getRes.body).toEqual({});
    });
  });
});
