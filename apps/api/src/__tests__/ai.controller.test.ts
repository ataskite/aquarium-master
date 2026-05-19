import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAuthenticatedUser } from '../test/test-helpers';

describe('AiController (e2e)', () => {
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
    ({ token } = await createAuthenticatedUser(app, getHttpServer()));
  });

  describe('POST /api/ai/chat', () => {
    it('returns 201 with answer and provider=echo', async () => {
      const res = await request(getHttpServer())
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          messages: [{ role: 'user', content: '我的鱼不吃东西怎么办？' }],
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          provider: 'echo',
          answer: expect.any(String),
        }),
      );
      expect(res.body.answer.length).toBeGreaterThan(0);
    });

    it('returns a response containing the echoed question text', async () => {
      const question = '水温偏高如何处理？';
      const res = await request(getHttpServer())
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          messages: [{ role: 'user', content: question }],
        });

      expect(res.status).toBe(201);
      expect(res.body.answer).toContain(question);
    });

    it('returns a response with a messages array containing multiple entries', async () => {
      const res = await request(getHttpServer())
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          messages: [
            { role: 'system', content: '你是水族助手' },
            { role: 'assistant', content: '有什么可以帮你的？' },
            { role: 'user', content: 'pH 值多少合适？' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          provider: 'echo',
          answer: expect.any(String),
        }),
      );
    });

    it('returns a response even with empty messages', async () => {
      const res = await request(getHttpServer())
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ messages: [] });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          provider: 'echo',
          answer: expect.any(String),
        }),
      );
    });

    it('returns a response when messages field is omitted', async () => {
      const res = await request(getHttpServer())
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          provider: 'echo',
          answer: expect.any(String),
        }),
      );
    });
  });
});
