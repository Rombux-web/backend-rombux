import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaffleParticipant } from '../entities/raffle-participant.entity';
import { CreateRaffleParticipantDto } from '../dto/create-raffle-participant.dto';

// Type guard para saber si el error tiene una propiedad 'code'
function hasCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

@Injectable()
export class RaffleService {
  constructor(
    @InjectRepository(RaffleParticipant)
    private readonly raffleRepository: Repository<RaffleParticipant>,
  ) {}

  async create(
    createDto: CreateRaffleParticipantDto,
  ): Promise<RaffleParticipant> {
    const participant = this.raffleRepository.create(createDto);
    try {
      return await this.raffleRepository.save(participant);
    } catch (error: unknown) {
      if (hasCode(error) && error.code === '23505') {
        throw new ConflictException(
          'El email ya está registrado para el sorteo',
        );
      }
      throw error;
    }
  }
}
