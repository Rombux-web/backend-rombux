import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission } from '../entities/contact-submission.entity';
import { CreateContactSubmissionDto } from '../dto/create-contact-submission.dto';

function hasCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private readonly contactRepository: Repository<ContactSubmission>,
  ) {}

  async create(
    createDto: CreateContactSubmissionDto,
  ): Promise<ContactSubmission> {
    const submission = this.contactRepository.create(createDto);
    try {
      return await this.contactRepository.save(submission);
    } catch (error) {
      if (hasCode(error) && error.code === '23505') {
        throw new ConflictException(
          'El email ya está registrado en un formulario de contacto',
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
    const [submissions, total] = await this.contactRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    return {
      data: submissions,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }
}
