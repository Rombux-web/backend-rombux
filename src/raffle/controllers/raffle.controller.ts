import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RaffleService } from '../services/raffle.service';
import { CreateRaffleParticipantDto } from '../dto/create-raffle-participant.dto';
import { RaffleParticipant } from '../entities/raffle-participant.entity';

type PaginatedParticipants = {
  data: RaffleParticipant[];
  total: number;
  page: number;
  last_page: number;
};

@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Post('participate')
  async participate(
    @Body() createRaffleParticipantDto: CreateRaffleParticipantDto,
  ): Promise<RaffleParticipant> {
    return this.raffleService.create(createRaffleParticipantDto);
  }

  @Get('participants')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedParticipants> {
    return this.raffleService.findAll(page, limit);
  }
}
