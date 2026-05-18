import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';

async function createTestUser(code = 'user-test') {
  const res = await request(getHttpServer())
    .post('/api/auth/wechat-login')
    .send({ code });
  return res.body.user;
}

describe('UsersController', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/users/:id', () => {
    it('returns 200 with user data including aquariums and reminders arrays', async () => {
      const user = await createTestUser();

      const res = await request(getHttpServer()).get(`/api/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(user.id);
      expect(res.body.openId).toBe(user.openId);
      expect(Array.isArray(res.body.aquariums)).toBe(true);
      expect(Array.isArray(res.body.reminders)).toBe(true);
    });

    it('returns null for non-existent user', async () => {
      const res = await request(getHttpServer()).get('/api/users/non-existent-id');

      expect(res.status).toBe(200);
      // NestJS serializes null controller return values as an empty body
      // which supertest parses as {}
      expect(res.body).toEqual({});
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('updates nickname', async () => {
      const user = await createTestUser();

      const res = await request(getHttpServer())
        .patch(`/api/users/${user.id}`)
        .send({ nickname: 'New Nickname' });

      expect(res.status).toBe(200);
      expect(res.body.nickname).toBe('New Nickname');
    });

    it('updates avatarUrl', async () => {
      const user = await createTestUser();

      const res = await request(getHttpServer())
        .patch(`/api/users/${user.id}`)
        .send({ avatarUrl: 'https://example.com/new-avatar.png' });

      expect(res.status).toBe(200);
      expect(res.body.avatarUrl).toBe('https://example.com/new-avatar.png');
    });
  });
});
