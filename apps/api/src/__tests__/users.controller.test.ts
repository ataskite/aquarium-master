import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAuthenticatedUser } from '../test/test-helpers';

describe('UsersController', () => {
  let userId: string;
  let token: string;

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
  });

  describe('GET /api/users/me', () => {
    it('returns 200 with user data including aquariums and reminders arrays', async () => {
      const res = await request(getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(userId);
      expect(res.body.openId).toBeDefined();
      expect(Array.isArray(res.body.aquariums)).toBe(true);
      expect(Array.isArray(res.body.reminders)).toBe(true);
    });

    it('returns 401 without auth', async () => {
      const res = await request(getHttpServer())
        .get('/api/users/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('updates nickname', async () => {
      const res = await request(getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ nickname: 'New Nickname' });

      expect(res.status).toBe(200);
      expect(res.body.nickname).toBe('New Nickname');
    });

    it('updates avatarUrl', async () => {
      const res = await request(getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatarUrl: 'https://example.com/new-avatar.png' });

      expect(res.status).toBe(200);
      expect(res.body.avatarUrl).toBe('https://example.com/new-avatar.png');
    });
  });
});
