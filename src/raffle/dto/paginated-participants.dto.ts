// src/raffle/dto/paginated-participants.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { RaffleParticipant } from '../entities/raffle-participant.entity';

export class PaginatedParticipantsDto {
  @ApiProperty({ type: [RaffleParticipant] })
  data: RaffleParticipant[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3, description: 'Última página disponible' })
  last_page: number;
}
