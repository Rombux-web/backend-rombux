import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission } from '../entities/contact-submission.entity';
import { CreateContactSubmissionDto } from '../dto/create-contact-submission.dto';
import { ContactPostEmailService } from '../../email/contact-post-email.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactSubmission)
    private readonly contactRepo: Repository<ContactSubmission>,
    private readonly contactPostEmailService: ContactPostEmailService,
  ) {}

  async create(
    createContactSubmissionDto: CreateContactSubmissionDto,
  ): Promise<ContactSubmission> {
    const contact = this.contactRepo.create(createContactSubmissionDto);

    let saved: ContactSubmission;
    try {
      saved = await this.contactRepo.save(contact);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      if (typeof error === 'string') {
        throw new Error(error);
      }
      throw new Error('Unknown error');
    }

    // Enviar email después de guardar el contacto
    try {
      await this.contactPostEmailService.sendContactEmail(
        createContactSubmissionDto,
      );
    } catch (mailError) {
      this.logger.error(`Error enviando email de contacto: ${mailError}`);
      // Aquí decides si solo loguear el error o lanzar una excepción
      // throw new Error('No se pudo enviar el correo de contacto'); // Si quieres fallar la petición
    }

    return saved;
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
