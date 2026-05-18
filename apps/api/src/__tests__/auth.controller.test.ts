import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';

describe('AuthController', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/wechat-login', () => {
    it('returns 201 with token, user, and session', async () => {
      const res = await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'test-code-1' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('session');
    });

    it('returns a token that contains "demo-token-"', async () => {
      const res = await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'test-code-2' });

      expect(res.status).toBe(201);
      expect(res.body.token).toContain('demo-token-');
    });

    it('returns session.openid as mock-openid-{code}', async () => {
      const res = await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'abc123' });

      expect(res.status).toBe(201);
      expect(res.body.session.openid).toBe('mock-openid-abc123');
    });

    it('creates a user in the database', async () => {
      const res = await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'create-user' });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.openId).toBe('mock-openid-create-user');
    });

    it('upserts user on second call with same code (same openid)', async () => {
      const first = await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'upsert-test' });

      // Clear only non-user tables to preserve the user for upsert verification
      const second = await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'upsert-test' });

      expect(first.status).toBe(201);
      expect(second.status).toBe(201);
      // Same user returned for the same openid
      expect(first.body.user.openId).toBe('mock-openid-upsert-test');
      expect(second.body.user.openId).toBe('mock-openid-upsert-test');
      expect(first.body.user.id).toBe(second.body.user.id);
    });

    it('updates nickname and avatarUrl on upsert', async () => {
      await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'profile-update', nickname: 'First Name', avatarUrl: 'https://example.com/first.jpg' });

      const res = await request(getHttpServer())
        .post('/api/auth/wechat-login')
        .send({ code: 'profile-update', nickname: 'Updated Name', avatarUrl: 'https://example.com/updated.jpg' });

      expect(res.status).toBe(201);
      expect(res.body.user.nickname).toBe('Updated Name');
      expect(res.body.user.avatarUrl).toBe('https://example.com/updated.jpg');
    });
  });
});
