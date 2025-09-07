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
import { PaginatedParticipantsDto } from '../dto/paginated-participants.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Raffle')
@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Post('participate')
  @ApiOperation({ summary: 'Registrar un participante en el sorteo' })
  @ApiBody({ type: CreateRaffleParticipantDto })
  @ApiResponse({
    status: 201,
    description: 'Participante registrado exitosamente',
    type: RaffleParticipant,
  })
  async participate(
    @Body() createRaffleParticipantDto: CreateRaffleParticipantDto,
  ): Promise<RaffleParticipant> {
    return this.raffleService.create(createRaffleParticipantDto);
  }

  @Get('participants')
  @ApiOperation({ summary: 'Listar participantes del sorteo paginados' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Límite por página (default 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de participantes',
    type: PaginatedParticipantsDto,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedParticipantsDto> {
    return this.raffleService.findAll(page, limit);
  }
}
