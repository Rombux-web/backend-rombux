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

  async findAll(page = 1, limit = 10) {
    if (isNaN(page) || isNaN(limit)) {
      throw new ConflictException(
        'Los parámetros de paginación deben ser números',
      );
    }
    if (page < 1 || limit < 1) {
      throw new ConflictException(
        'Los parámetros de paginación deben ser mayores que 0',
      );
    }
    if (limit > 100) {
      throw new ConflictException(
        'El límite de resultados por página no puede ser mayor a 100',
      );
    }
    const skip = (page - 1) * limit;
    const [participants, total] = await this.raffleRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    return {
      data: participants,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }
}
