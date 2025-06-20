import { Controller, Post, Body } from '@nestjs/common';
import { RaffleService } from '../services/raffle.service';
import { CreateRaffleParticipantDto } from '../dto/create-raffle-participant.dto';
import { RaffleParticipant } from '../entities/raffle-participant.entity';

@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Post('participate')
  async participate(
    @Body() createRaffleParticipantDto: CreateRaffleParticipantDto,
  ): Promise<RaffleParticipant> {
    return this.raffleService.create(createRaffleParticipantDto);
  }
}
