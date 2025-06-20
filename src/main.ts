import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo permite propiedades decoradas en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían datos no permitidos
      transform: true, // Transforma los payloads al tipo del DTO
    }),
  );
  await app.listen(3000);
}
bootstrap();
