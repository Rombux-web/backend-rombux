import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsArray,
  ArrayMinSize,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const AREAS_DE_SERVICIO = [
  'Benchmarking',
  'Branding',
  'Marketing Digital',
  'Growth',
  'Data&AI',
];

export class CreateContactSubmissionDto {
  @ApiProperty({ description: 'Nombre', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@empresa.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Empresa', example: 'Empresa S.A.' })
  @IsString()
  @IsNotEmpty()
  empresa: string;

  @ApiProperty({
    description: 'Teléfono',
    example: '+56912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({
    description: 'Mensaje',
    example: 'Me gustaría información sobre sus servicios.',
    type: String,
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @ApiProperty({
    description: 'Áreas de servicio',
    example: ['Benchmarking', 'Growth'],
    isArray: true,
    enum: AREAS_DE_SERVICIO,
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(AREAS_DE_SERVICIO, { each: true })
  area_de_servicio: string[];
}
