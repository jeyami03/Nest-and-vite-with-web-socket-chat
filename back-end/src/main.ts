import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for React frontend
  app.enableCors({
    // origin: 'http://localhost:5173', // Vite dev server default port
    origin: '*', // Vite dev server default port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Create upload directories
  const uploadsDir = join(__dirname, '..', 'uploads');
  const profilesDir = join(uploadsDir, 'profiles');
  const chatDir = join(uploadsDir, 'chat');

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir);
  }
  if (!existsSync(profilesDir)) {
    mkdirSync(profilesDir);
  }
  if (!existsSync(chatDir)) {
    mkdirSync(chatDir);
  }

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Chat API')
    .setDescription(
      'A real-time chat application API with authentication and file uploads',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
