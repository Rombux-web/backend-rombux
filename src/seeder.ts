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
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? (e as { message: string }).message
          : String(e);
      console.warn(`No se pudo sembrar ${email}:`, msg);
    }
  }

  console.log(`\nTotal de participantes sembrados: ${sembrados}`);
  await appContext.close();
}

bootstrap();
