import { Module } from '@nestjs/common';
import { RaffleController } from './controllers/raffle.controller';
import { RaffleService } from './services/raffle.service';

@Module({
  controllers: [RaffleController],
  providers: [RaffleService],
})
export class RaffleModule {}
