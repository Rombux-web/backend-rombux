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

    it('should throw original error if error has no code property', async () => {
      const participant = {
        id: 1,
        email: 'test@mail.com',
        createdAt: new Date(),
      } as RaffleParticipant;
      jest.spyOn(repo, 'create').mockReturnValue(participant);

      const error: any = new Error('no code property');
      jest.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(service.create({ email: 'otro@mail.com' })).rejects.toThrow(
        'no code property',
      );
    });

    it('should throw if error is a string (covers hasCode=false)', async () => {
      const participant = {
        id: 1,
        email: 'test@mail.com',
        createdAt: new Date(),
      } as RaffleParticipant;
      jest.spyOn(repo, 'create').mockReturnValue(participant);

      jest.spyOn(repo, 'save').mockRejectedValue('totally not an object');
      await expect(service.create({ email: 'falso@mail.com' })).rejects.toEqual(
        'totally not an object',
      );
    });
  });

  describe('findAll validations', () => {
    beforeEach(() => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0]);
    });

    // ------------- isNaN y valores de borde -----------------
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

    it('should throw if both page and limit are NaN', async () => {
      await expect(service.findAll(NaN, NaN)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should NOT throw if page is undefined (defaults to 1)', async () => {
      const result = await service.findAll(undefined as any, 10);
      expect(result).toHaveProperty('data');
    });

    it('should NOT throw if limit is undefined (defaults to 10)', async () => {
      const result = await service.findAll(1, undefined as any);
      expect(result).toHaveProperty('data');
    });

    it('should throw if page is null (null is coerced to 0, which is < 1)', async () => {
      await expect(service.findAll(null as any, 10)).rejects.toThrow(
        'Los parámetros de paginación deben ser mayores que 0',
      );
    });

    it('should throw if limit is null (null is coerced to 0, which is < 1)', async () => {
      await expect(service.findAll(1, null as any)).rejects.toThrow(
        'Los parámetros de paginación deben ser mayores que 0',
      );
    });

    it('should throw if page is a string', async () => {
      await expect(service.findAll('a' as any, 10)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if limit is a string', async () => {
      await expect(service.findAll(1, 'b' as any)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    // ------------- parámetros numéricos fuera de rango -----------------
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
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });
});
