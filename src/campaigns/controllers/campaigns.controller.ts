import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { CampaignsService } from '../services/campaigns.service';
import { CreateCampaignSubmissionDto } from '../dto/create-campaign-submission.dto';
import { validateRecaptcha } from '../../contact/utils/recaptcha';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Enviar formulario de campaña' })
  @ApiBody({ type: CreateCampaignSubmissionDto })
  @ApiResponse({ status: 201, description: 'Envío de campaña guardado' })
  async submit(@Body() dto: CreateCampaignSubmissionDto, @Req() req: Request) {
    // Verificamos reCAPTCHA (reutilizamos la util existente)
    const captchaValid = await validateRecaptcha(dto.captchaToken);
    if (!captchaValid) {
      throw new ForbiddenException('Captcha inválido');
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    const userAgent = req.get('user-agent') || '';

    return this.campaignsService.create({
      ...dto,
      ip,
      user_agent: userAgent,
    } as any);
  }

  @Get('submissions')
  @ApiOperation({ summary: 'Listar envíos de campañas (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.campaignsService.findAll(page, limit);
  }
}
