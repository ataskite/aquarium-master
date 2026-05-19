import { JwtService } from '@nestjs/jwt';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function getTestAuthToken(
  app: INestApplication,
  userId: string,
  openId = 'test-openid',
): Promise<string> {
  const jwt = app.get(JwtService);
  return jwt.sign({ userId, openId });
}

export async function createAuthenticatedUser(
  app: INestApplication,
  server: unknown,
  code = `test-user-${Date.now()}`,
): Promise<{ userId: string; token: string }> {
  const res = await request(server as Parameters<typeof request>[0])
    .post('/api/auth/wechat-login')
    .send({ code });
  const token = await getTestAuthToken(app, res.body.user.id, res.body.user.openId);
  return { userId: res.body.user.id, token };
}
