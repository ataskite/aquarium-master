import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, getHttpServer, closeTestApp } from '../test/test-app';
import { cleanDatabase } from '../test/database';
import { createAquarium, createReminder } from '../test/fixtures';

describe('RemindersController', () => {
  let userId: string;
  let aquariumId: string;

  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const authRes = await request(getHttpServer())
      .post('/api/auth/wechat-login')
      .send({ code: 'test-setup' });
    userId = authRes.body.user.id;

    const tankRes = await request(getHttpServer())
      .post('/api/aquariums')
      .send(createAquarium(userId));
    aquariumId = tankRes.body.id;
  });

  it('GET /api/reminders returns empty array initially', async () => {
    const res = await request(getHttpServer())
      .get('/api/reminders');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/reminders creates a reminder', async () => {
    const payload = createReminder(userId, aquariumId);
    const res = await request(getHttpServer())
      .post('/api/reminders')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      userId,
      aquariumId,
      status: 'PENDING',
    });
    expect(res.body.title).toContain('Test Reminder');
    expect(res.body.id).toBeDefined();
  });

  it('GET /api/reminders returns reminders ordered by dueAt asc', async () => {
    const base = createReminder(userId, aquariumId);

    await request(getHttpServer())
      .post('/api/reminders')
      .send({ ...base, dueAt: new Date('2026-02-01T10:00:00Z').toISOString() });

    await request(getHttpServer())
      .post('/api/reminders')
      .send({ ...base, dueAt: new Date('2026-01-01T10:00:00Z').toISOString() });

    await request(getHttpServer())
      .post('/api/reminders')
      .send({ ...base, dueAt: new Date('2026-03-01T10:00:00Z').toISOString() });

    const res = await request(getHttpServer())
      .get('/api/reminders');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    const dates = res.body.map((r: { dueAt: string }) => new Date(r.dueAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
    }
  });

  it('GET /api/reminders?userId=xxx filters by user', async () => {
    const secondAuthRes = await request(getHttpServer())
      .post('/api/auth/wechat-login')
      .send({ code: 'test-setup-other' });
    const secondUserId = secondAuthRes.body.user.id;

    await request(getHttpServer())
      .post('/api/reminders')
      .send(createReminder(userId, aquariumId));

    await request(getHttpServer())
      .post('/api/reminders')
      .send(createReminder(secondUserId, aquariumId));

    const res = await request(getHttpServer())
      .get('/api/reminders')
      .query({ userId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe(userId);
  });

  it('GET /api/reminders?aquariumId=xxx filters by aquarium', async () => {
    const secondTankRes = await request(getHttpServer())
      .post('/api/aquariums')
      .send(createAquarium(userId, { name: 'Second Tank' }));
    const secondAquariumId = secondTankRes.body.id;

    await request(getHttpServer())
      .post('/api/reminders')
      .send(createReminder(userId, aquariumId));

    await request(getHttpServer())
      .post('/api/reminders')
      .send(createReminder(userId, secondAquariumId));

    const res = await request(getHttpServer())
      .get('/api/reminders')
      .query({ aquariumId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].aquariumId).toBe(aquariumId);
  });

  it('PATCH /api/reminders/:id updates status to DONE', async () => {
    const createRes = await request(getHttpServer())
      .post('/api/reminders')
      .send(createReminder(userId, aquariumId));
    const reminderId = createRes.body.id;

    const patchRes = await request(getHttpServer())
      .patch(`/api/reminders/${reminderId}`)
      .send({ status: 'DONE' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('DONE');
  });

  it('DELETE /api/reminders/:id removes the reminder', async () => {
    const createRes = await request(getHttpServer())
      .post('/api/reminders')
      .send(createReminder(userId, aquariumId));
    const reminderId = createRes.body.id;

    const deleteRes = await request(getHttpServer())
      .delete(`/api/reminders/${reminderId}`);

    expect(deleteRes.status).toBe(200);

    const listRes = await request(getHttpServer())
      .get('/api/reminders');
    expect(listRes.body).toHaveLength(0);
  });
});
