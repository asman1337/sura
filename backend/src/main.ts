import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const corsOrigins: string[] = corsOrigin
    ? corsOrigin.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5567',
        'https://sura.otmalse.in',
      ];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow cookies to be sent with requests
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = configService.get<number>('PORT', 3000) ?? 3000;
  await app.listen(port);
}

void bootstrap();
