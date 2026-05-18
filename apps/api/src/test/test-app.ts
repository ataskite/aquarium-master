import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';

let app: INestApplication | null = null;

export async function createTestApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api');
    await app.init();
  }
  return app;
}

export function getHttpServer(): Server {
  if (!app) throw new Error('Test app not initialized');
  return app.getHttpServer() as Server;
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
    app = null;
  }
}
