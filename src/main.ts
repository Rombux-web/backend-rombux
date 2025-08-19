import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://frontend.rombux.com',
      'https://repo-prueba-taupe.vercel.app/',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- SWAGGER SETUP ---
  const config = new DocumentBuilder()
    .setTitle('ROMBUX API')
    .setDescription('Documentación automática de la API de ROMBUX')
    .setVersion('1.0')
    .addBearerAuth() // Si tienes JWT/Bearer tokens
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // --- FIN SWAGGER SETUP ---

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`API ROMBUX backend escuchando en http://localhost:${port}`);
}
bootstrap();
