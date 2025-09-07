import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleController } from './controllers/raffle.controller';
import { RaffleService } from './services/raffle.service';
import { RaffleParticipant } from './entities/raffle-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaffleParticipant]), // Import the RaffleParticipant entity for TypeORM
  ],
  controllers: [RaffleController],
  providers: [RaffleService],
})
export class RaffleModule {}
