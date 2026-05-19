import 'reflect-metadata';

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  ?? 'postgresql://aquarium:aquarium@localhost:5432/aquarium_test?schema=public';
process.env.WECHAT_APP_ID = '';
process.env.WECHAT_APP_SECRET = '';
process.env.AI_PROVIDER = 'echo';
process.env.AI_HTTP_ENDPOINT = '';
process.env.MINIO_ENDPOINT = 'http://localhost:9000';
process.env.MINIO_PUBLIC_ENDPOINT = 'http://localhost:9000';
process.env.MINIO_ACCESS_KEY = 'minioadmin';
process.env.MINIO_SECRET_KEY = 'minioadmin';
process.env.MINIO_BUCKET = 'aquarium-test';
process.env.API_PORT = '0';
process.env.JWT_SECRET = 'test-jwt-secret';
