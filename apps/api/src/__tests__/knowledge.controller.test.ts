import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAuthenticatedUser } from '../test/test-helpers';

const prisma = new PrismaClient();

describe('KnowledgeController (e2e)', () => {
  let token: string;

  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const app = await createTestApp();
    ({ token } = await createAuthenticatedUser(app, getHttpServer()));
  });

  describe('GET /api/knowledge', () => {
    it('returns seed articles when DB is empty', async () => {
      const res = await request(getHttpServer())
        .get('/api/knowledge')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('returns DB articles when populated', async () => {
      await prisma.knowledgeArticle.create({
        data: {
          id: 'test-article-001',
          title: 'Test Article',
          category: '测试',
          summary: 'A test article',
          content: 'Test content for integration test.',
        },
      });

      const res = await request(getHttpServer())
        .get('/api/knowledge')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-article-001',
            title: 'Test Article',
            category: '测试',
          }),
        ]),
      );
    });

    it('filters articles by category query param', async () => {
      await prisma.knowledgeArticle.create({
        data: {
          id: 'test-article-cat-a',
          title: 'Cat A Article',
          category: 'CategoryA',
          summary: 'Summary A',
          content: 'Content A',
        },
      });
      await prisma.knowledgeArticle.create({
        data: {
          id: 'test-article-cat-b',
          title: 'Cat B Article',
          category: 'CategoryB',
          summary: 'Summary B',
          content: 'Content B',
        },
      });

      const res = await request(getHttpServer())
        .get('/api/knowledge?category=CategoryA')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: 'CategoryA' }),
        ]),
      );
      expect(res.body).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: 'CategoryB' }),
        ]),
      );
    });
  });

  describe('GET /api/knowledge/:id', () => {
    it('returns a specific seed article by id', async () => {
      const res = await request(getHttpServer())
        .get('/api/knowledge/cycle-basics')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: 'cycle-basics',
          title: '开缸硝化系统基础',
        }),
      );
    });

    it('returns a DB article by id', async () => {
      await prisma.knowledgeArticle.create({
        data: {
          id: 'test-article-detail',
          title: 'Detail Article',
          category: '测试',
          summary: 'Summary',
          content: 'Content',
        },
      });

      const res = await request(getHttpServer())
        .get('/api/knowledge/test-article-detail')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: 'test-article-detail',
          title: 'Detail Article',
        }),
      );
    });

    it('returns null for non-existent id', async () => {
      const res = await request(getHttpServer())
        .get('/api/knowledge/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });
  });
});
