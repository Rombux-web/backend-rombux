import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RaffleService } from './raffle/services/raffle.service';
import { faker } from '@faker-js/faker';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const raffleService = appContext.get(RaffleService);

  const cantidad = 200;
  let sembrados = 0;

  for (let i = 0; i < cantidad; i++) {
    const email = faker.internet.email();

    try {
      await raffleService.create({ email });
      sembrados++;
      console.log(`Sembrado: ${email}`);
    } catch (e) {
      // Es posible que por colisión de emails se rechacen algunos
      console.warn(`No se pudo sembrar ${email}:`, e.message);
    }
  }

  console.log(`\nTotal de participantes sembrados: ${sembrados}`);
  await appContext.close();
}

bootstrap();
