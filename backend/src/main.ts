import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Client } from 'pg';
import { AppModule } from './app.module';

/**
 * Each entity lives in its own Postgres schema. `synchronize` creates the
 * tables but NOT the schemas, so ensure they exist before Nest connects.
 */
async function ensureSchemas() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const client = new Client({ connectionString: url });
  await client.connect();
  for (const schema of ['auth', 'user', 'school', 'notification']) {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  }
  await client.end();
}

async function bootstrap() {
  await ensureSchemas();

  const app = await NestFactory.create(AppModule);

  const origins = (
    process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
