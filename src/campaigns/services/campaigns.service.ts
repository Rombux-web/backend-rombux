import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CampaignSubmission } from '../entities/campaign-submission.entity';
import { CreateCampaignSubmissionDto } from '../dto/create-campaign-submission.dto';
import { ContactPostEmailService } from '../../email/contact-post-email.service'; // <- import

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(CampaignSubmission)
    private readonly repo: Repository<CampaignSubmission>,
    private readonly contactPostEmailService: ContactPostEmailService, // <- inyectado
  ) {}

  /**
   * Crea un nuevo envío de campaña.
   * @param dto CreateCampaignSubmissionDto + campos opcionales ip/user_agent
   */
  async create(
    dto: CreateCampaignSubmissionDto & { ip?: string; user_agent?: string },
  ): Promise<CampaignSubmission> {
    const entityData: DeepPartial<CampaignSubmission> = {
      campaign: dto.campaign,
      payload: dto.payload as Record<string, unknown>,
      ip: dto.ip ?? undefined,
      user_agent: dto.user_agent ?? undefined,
      source: dto.source ?? 'web',
    };

    const entity = this.repo.create(entityData);

    let saved: CampaignSubmission;
    try {
      saved = await this.repo.save(entity);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Error guardando campaign submission', error.stack);
        throw new InternalServerErrorException(
          'Error guardando envío de campaña',
        );
      }

      try {
        this.logger.error(
          'Error guardando campaign submission (no serializable)',
          JSON.stringify(error),
        );
      } catch {
        this.logger.error(
          'Error guardando campaign submission (no serializable)',
        );
      }
      throw new InternalServerErrorException(
        'Error guardando envío de campaña',
      );
    }

    // Envío de email y marcado como processed al confirmar envío
    try {
      this.logger.log(
        `DEBUG: about to call sendCampaignEmail for id=${saved.id}`,
      );
      await this.contactPostEmailService.sendCampaignEmail({
        id: saved.id,
        campaign: saved.campaign,
        payload: saved.payload,
        received_at: saved.received_at,
        source: saved.source,
        ip: saved.ip,
        user_agent: saved.user_agent,
      });
      this.logger.log(`DEBUG: sendCampaignEmail resolved for id=${saved.id}`);

      // Marcar como procesado solo después de que el envío sea exitoso
      saved.processed = true;
      saved.processed_at = new Date();
      await this.repo.save(saved);
      this.logger.log(
        `Campaign submission id=${saved.id} marcado como processed`,
      );
    } catch (mailErr: unknown) {
      if (mailErr instanceof Error) {
        this.logger.error(
          `Error enviando email de campaign id=${saved.id}: ${mailErr.message}`,
          mailErr.stack,
        );
      } else {
        this.logger.error(
          `Error enviando email de campaign id=${saved.id}: ${String(mailErr)}`,
        );
      }
      // No lanzamos para no romper la respuesta al usuario; queda recorded pero unprocessed.
    }

    return saved;
  }

  /**
   * Listado paginado de envíos de campañas.
   */
  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: CampaignSubmission[];
    total: number;
    page: number;
    last_page: number;
  }> {
    if (
      typeof page !== 'number' ||
      typeof limit !== 'number' ||
      isNaN(page) ||
      isNaN(limit)
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

    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { received_at: 'DESC' },
    });

    return {
      data,
      total,
      page,
      last_page: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
