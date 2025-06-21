import { Test, TestingModule } from '@nestjs/testing';
import { RaffleService } from './raffle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RaffleParticipant } from '../entities/raffle-participant.entity';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('RaffleService', () => {
  let service: RaffleService;
  let repo: Repository<RaffleParticipant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaffleService,
        {
          provide: getRepositoryToken(RaffleParticipant),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RaffleService>(RaffleService);
    repo = module.get<Repository<RaffleParticipant>>(
      getRepositoryToken(RaffleParticipant),
    );
  });

  describe('create', () => {
    it('should create a participant successfully', async () => {
      const participant = {
        id: 1,
        email: 'test@mail.com',
        createdAt: new Date(),
      } as RaffleParticipant;
      jest.spyOn(repo, 'create').mockReturnValue(participant);
      jest.spyOn(repo, 'save').mockResolvedValue(participant);

      const result = await service.create({ email: 'test@mail.com' });
      expect(result).toEqual(participant);
    });

    it('should throw ConflictException if email already exists', async () => {
      const participant = {
        id: 1,
        email: 'test@mail.com',
        createdAt: new Date(),
      } as RaffleParticipant;
      jest.spyOn(repo, 'create').mockReturnValue(participant);

      // Simula error con code 23505
      const error: any = new Error('duplicate');
      error.code = '23505';
      jest.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(
        service.create({ email: 'duplicado@mail.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw the original error if error is not 23505', async () => {
      const participant = {
        id: 1,
        email: 'test@mail.com',
        createdAt: new Date(),
      } as RaffleParticipant;
      jest.spyOn(repo, 'create').mockReturnValue(participant);

      const error: any = new Error('unknown error');
      error.code = '99999';
      jest.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(service.create({ email: 'algo@mail.com' })).rejects.toThrow(
        'unknown error',
      );
    });
  });

  describe('findAll validations', () => {
    beforeEach(() => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0]);
    });

    it('should throw if page is NaN', async () => {
      await expect(service.findAll(NaN, 10)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if limit is NaN', async () => {
      await expect(service.findAll(1, NaN)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if page < 1', async () => {
      await expect(service.findAll(0, 10)).rejects.toThrow(
        'Los parámetros de paginación deben ser mayores que 0',
      );
    });

    it('should throw if limit < 1', async () => {
      await expect(service.findAll(1, 0)).rejects.toThrow(
        'Los parámetros de paginación deben ser mayores que 0',
      );
    });

    it('should throw if limit > 100', async () => {
      await expect(service.findAll(1, 101)).rejects.toThrow(
        'El límite de resultados por página no puede ser mayor a 100',
      );
    });

    it('should call findAndCount with correct params', async () => {
      const participants = [
        { id: 1, email: 'usuario1@mail.com', createdAt: new Date() },
        { id: 2, email: 'usuario2@mail.com', createdAt: new Date() },
      ] as RaffleParticipant[];
      const mockFn = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([participants, 2]);

      const result = await service.findAll(1, 10);
      expect(mockFn).toHaveBeenCalledWith({
        skip: 0, // (1-1)*10 = 0
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });
});
