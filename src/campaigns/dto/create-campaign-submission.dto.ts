import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignSubmissionDto {
  @ApiProperty({
    example: 'ebook_TransDigital',
    description: 'Nombre de la campaña',
  })
  @IsString()
  @IsNotEmpty()
  campaign: string;

  @ApiProperty({
    description:
      'Payload enviado por el front (JSON con campos específicos de la landing)',
    type: 'object',
    example: { nombre: 'Juan', apellido: 'Pérez', email: 'juan@ejemplo.com' },
    additionalProperties: true,
  })
  @IsObject()
  @IsNotEmpty()
  payload: Record<string, unknown>;

  @ApiProperty({
    description: 'Token de reCAPTCHA (v2/v3) recibido del frontend',
    example: 'token...',
  })
  @IsString()
  @IsNotEmpty()
  captchaToken: string;

  @ApiPropertyOptional({ description: 'Origen del envío', example: 'web' })
  @IsOptional()
  @IsString()
  source?: string;
}
