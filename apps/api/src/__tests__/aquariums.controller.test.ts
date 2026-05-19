import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAuthenticatedUser } from '../test/test-helpers';

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
    it('returns 401 without auth', async () => {
      const res = await request(getHttpServer()).get('/api/aquariums');
      expect(res.status).toBe(401);
    });

    it('returns empty array for authenticated user', async () => {
      const app = await createTestApp();
      const { token } = await createAuthenticatedUser(app, getHttpServer());

      const res = await request(getHttpServer())
        .get('/api/aquariums')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('returns only the authenticated user\'s aquariums', async () => {
      const app = await createTestApp();
      const { token, userId } = await createAuthenticatedUser(app, getHttpServer(), 'user1');

      await request(getHttpServer())
        .post('/api/aquariums')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'User1 Tank', userId, status: 'RUNNING', healthScore: 90 });

      const res = await request(getHttpServer())
        .get('/api/aquariums')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('User1 Tank');
    });
  });

  describe('POST /api/aquariums', () => {
    it('creates an aquarium for the authenticated user', async () => {
      const app = await createTestApp();
      const { token, userId } = await createAuthenticatedUser(app, getHttpServer());

      const res = await request(getHttpServer())
        .post('/api/aquariums')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Tank', status: 'RUNNING', healthScore: 90 });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Tank');
      expect(res.body.userId).toBe(userId);
    });

    it('returns 401 without auth', async () => {
      const res = await request(getHttpServer())
        .post('/api/aquariums')
        .send({ name: 'No Auth Tank' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/aquariums/:id', () => {
    it('returns full aquarium with all includes for owner', async () => {
      const app = await createTestApp();
      const { token } = await createAuthenticatedUser(app, getHttpServer());

      const createRes = await request(getHttpServer())
        .post('/api/aquariums')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Detail Tank', volumeLiters: 100 });
      const aquariumId = createRes.body.id;

      const res = await request(getHttpServer())
        .get(`/api/aquariums/${aquariumId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(aquariumId);
      expect(Array.isArray(res.body.fishStocks)).toBe(true);
      expect(Array.isArray(res.body.devices)).toBe(true);
      expect(res.body).toHaveProperty('waterProfile');
      expect(Array.isArray(res.body.feedingTemplates)).toBe(true);
      expect(Array.isArray(res.body.waterRecords)).toBe(true);
      expect(Array.isArray(res.body.maintenanceRecords)).toBe(true);
      expect(Array.isArray(res.body.reminders)).toBe(true);
    });

    it('returns 401 without auth', async () => {
      const res = await request(getHttpServer())
        .get('/api/aquariums/non-existent-id');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/aquariums/:id', () => {
    it('updates name for owner', async () => {
      const app = await createTestApp();
      const { token } = await createAuthenticatedUser(app, getHttpServer());

      const createRes = await request(getHttpServer())
        .post('/api/aquariums')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original Name' });
      const aquariumId = createRes.body.id;

      const res = await request(getHttpServer())
        .patch(`/api/aquariums/${aquariumId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Renamed Tank' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Renamed Tank');
    });

    it('returns 401 without auth', async () => {
      const res = await request(getHttpServer())
        .patch('/api/aquariums/some-id')
        .send({ name: 'No Auth Update' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/aquariums/:id', () => {
    it('removes the aquarium owned by the user', async () => {
      const app = await createTestApp();
      const { token } = await createAuthenticatedUser(app, getHttpServer());

      const createRes = await request(getHttpServer())
        .post('/api/aquariums')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', status: 'RUNNING', healthScore: 90 });

      const deleteRes = await request(getHttpServer())
        .delete(`/api/aquariums/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
    });

    it('returns 401 without auth', async () => {
      const res = await request(getHttpServer())
        .delete('/api/aquariums/some-id');

      expect(res.status).toBe(401);
    });
  });
});
