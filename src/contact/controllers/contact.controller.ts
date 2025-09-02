import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { CreateContactSubmissionDto } from '../dto/create-contact-submission.dto';
import { ContactSubmission } from '../entities/contact-submission.entity';
import { PaginatedContactSubmissionsDto } from '../dto/paginated-contact-submissions.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { validateRecaptcha } from '../utils/recaptcha';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Enviar formulario de contacto' })
  @ApiBody({ type: CreateContactSubmissionDto })
  @ApiResponse({
    status: 201,
    description: 'Contacto guardado exitosamente',
    type: ContactSubmission,
  })
  async submit(
    @Body() createContactSubmissionDto: CreateContactSubmissionDto,
  ): Promise<ContactSubmission> {
    // Validar el token de reCAPTCHA antes de crear el contacto
    const captchaValid = await validateRecaptcha(
      createContactSubmissionDto.captchaToken,
    );
    if (!captchaValid) {
      throw new ForbiddenException('Captcha inválido');
    }

    // Si el captcha es válido, guardar el contacto normalmente
    return this.contactService.create(createContactSubmissionDto);
  }

  @Get('submissions')
  @ApiOperation({ summary: 'Listar formularios de contacto paginados' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Límite por página (default 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de formularios de contacto',
    type: PaginatedContactSubmissionsDto,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedContactSubmissionsDto> {
    return this.contactService.findAll(page, limit);
  }
}
