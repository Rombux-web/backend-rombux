import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission } from '../entities/contact-submission.entity';
import { CreateContactSubmissionDto } from '../dto/create-contact-submission.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private readonly contactRepo: Repository<ContactSubmission>,
  ) {}

  async create(
    createContactSubmissionDto: CreateContactSubmissionDto,
  ): Promise<ContactSubmission> {
    const contact = this.contactRepo.create(createContactSubmissionDto);

    try {
      return await this.contactRepo.save(contact);
    } catch (error) {
      // Type guard for PG error with 'code'
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string'
      ) {
        if ((error as { code: string }).code === '23505') {
          throw new ConflictException('El correo ya existe');
        }
      }
      // If error is instance of Error, rethrow it
      if (error instanceof Error) {
        throw error;
      }
      // If error is a string, wrap in Error and throw
      if (typeof error === 'string') {
        throw new Error(error);
      }
      // Otherwise throw a generic error
      throw new Error('Unknown error');
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: ContactSubmission[];
    total: number;
    page: number;
    last_page: number;
  }> {
    // Type checks for page and limit
    if (
      typeof page !== 'number' ||
      typeof limit !== 'number' ||
      isNaN(page) ||
      isNaN(limit) ||
      page === undefined ||
      limit === undefined
    ) {
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

    const [data, total] = await this.contactRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / limit) || 1,
    };
  }
}
