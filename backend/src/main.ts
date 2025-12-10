import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// Intention: Point d’entrée de l’API Nest
// Objectif: Configurer les sécurités globales (CORS, validation), documentation et démarrage
// Logique: Pipes globaux avec whitelist, Swagger en dev, préfixe /api et port configurable

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
      // Allow local dev frontend and same-origin
      const allowed = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });
  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/static/' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) =>
        new BadRequestException({ type: 'VALIDATION_ERROR', errors }),
    })
  );
  // Sécurité: empêche les propriétés inconnues et force la transformation des DTO
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Connected Plant Pot API')
    .setDescription('REST API for the Plantly connected plant pot platform')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // TODO: restrict Swagger in production (e.g., behind auth or disabled)
  // Intention: exposer la doc pour faciliter les intégrations; à restreindre en prod

  // TODO: Enable HTTPS in production with proper certificates
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
}

bootstrap();
