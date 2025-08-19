import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContactSubmission } from '../entities/contact-submission.entity';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

function isPgError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

describe('ContactService', () => {
  let service: ContactService;
  let repo: Repository<ContactSubmission>;

  const baseContact = {
    nombre: 'Test',
    apellido: 'User',
    email: 'test@empresa.com',
    empresa: 'Empresa S.A.',
    mensaje: 'Mensaje',
    area_de_servicio: ['Growth'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: getRepositoryToken(ContactSubmission),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    repo = module.get<Repository<ContactSubmission>>(
      getRepositoryToken(ContactSubmission),
    );
  });

  describe('create', () => {
    it('should create a contact successfully without telefono', async () => {
      const contact = {
        id: 1,
        ...baseContact,
        createdAt: new Date(),
      } as ContactSubmission;
      jest.spyOn(repo, 'create').mockReturnValue(contact);
      jest.spyOn(repo, 'save').mockResolvedValue(contact);

      const result = await service.create(baseContact);
      expect(result).toEqual(contact);
    });

    it('should create a contact successfully with telefono', async () => {
      const contactWithTelefono = {
        ...baseContact,
        telefono: '+56912345678',
      };
      const contact = {
        id: 2,
        ...contactWithTelefono,
        createdAt: new Date(),
      } as ContactSubmission;
      jest.spyOn(repo, 'create').mockReturnValue(contact);
      jest.spyOn(repo, 'save').mockResolvedValue(contact);

      const result = await service.create(contactWithTelefono);
      expect(result).toEqual(contact);
      expect(result.telefono).toBe('+56912345678');
    });

    it('should throw ConflictException if email already exists', async () => {
      const contact = {
        id: 1,
        ...baseContact,
        email: 'duplicado@empresa.com',
      } as ContactSubmission;
      jest.spyOn(repo, 'create').mockReturnValue(contact);

      // Simular error con code property
      const error = new Error('duplicate');
      (error as any).code = '23505';
      jest.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(
        service.create({ ...baseContact, email: 'duplicado@empresa.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw the original error if error is not 23505', async () => {
      const contact = {
        id: 1,
        ...baseContact,
        email: 'error@empresa.com',
      } as ContactSubmission;
      jest.spyOn(repo, 'create').mockReturnValue(contact);

      const error = new Error('unknown error');
      (error as any).code = '99999';
      jest.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(
        service.create({ ...baseContact, email: 'error@empresa.com' }),
      ).rejects.toThrow('unknown error');
    });

    it('should throw original error if error has no code property', async () => {
      const contact = {
        id: 1,
        ...baseContact,
        email: 'nocode@empresa.com',
      } as ContactSubmission;
      jest.spyOn(repo, 'create').mockReturnValue(contact);

      const error = new Error('no code property');
      jest.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(
        service.create({ ...baseContact, email: 'nocode@empresa.com' }),
      ).rejects.toThrow('no code property');
    });

    it('should throw if error is a string (covers hasCode=false)', async () => {
      const contact = {
        id: 1,
        ...baseContact,
        email: 'string@empresa.com',
      } as ContactSubmission;
      jest.spyOn(repo, 'create').mockReturnValue(contact);

      jest.spyOn(repo, 'save').mockRejectedValue(new Error('string error'));

      await expect(
        service.create({ ...baseContact, email: 'string@empresa.com' }),
      ).rejects.toThrow('string error');
    });
  });

  describe('findAll', () => {
    it('should throw if page is NaN', async () => {
      await expect(service.findAll(Number.NaN, 10)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if limit is NaN', async () => {
      await expect(service.findAll(1, Number.NaN)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if both page and limit are NaN', async () => {
      await expect(service.findAll(Number.NaN, Number.NaN)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if page is undefined', async () => {
      await expect(service.findAll(undefined as any, 10)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if limit is undefined', async () => {
      await expect(service.findAll(1, undefined as any)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if page is null', async () => {
      await expect(service.findAll(null as any, 10)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
      );
    });

    it('should throw if limit is null', async () => {
      await expect(service.findAll(1, null as any)).rejects.toThrow(
        'Los parámetros de paginación deben ser números',
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
      const contacts = [
        { id: 1, email: 'usuario1@mail.com', createdAt: new Date() },
        { id: 2, email: 'usuario2@mail.com', createdAt: new Date() },
      ] as ContactSubmission[];
      const mockFn = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([contacts, 2]);

      const result = await service.findAll(1, 10);

      expect(mockFn).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveProperty('data', contacts);
      expect(result).toHaveProperty('total', 2);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('last_page', 1);
    });
  });
});
