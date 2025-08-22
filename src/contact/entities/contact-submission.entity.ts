import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('contact_submissions')
export class ContactSubmission {
  @ApiProperty({
    description: 'ID único de la solicitud de contacto',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre', example: 'Juan' })
  @Column()
  nombre: string;

  @ApiProperty({ description: 'Apellido', example: 'Pérez' })
  @Column()
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico único',
    example: 'juan.perez@empresa.com',
  })
  email: string;

  @ApiProperty({ description: 'Empresa', example: 'Empresa S.A.' })
  @Column()
  empresa: string;

  @ApiProperty({
    description: 'Mensaje',
    example: 'Me gustaría información sobre sus servicios.',
    type: String,
  })
  @Column({ type: 'text' })
  mensaje: string;

  @ApiProperty({
    description: 'Áreas de servicio',
    example: ['Benchmarking', 'Growth'],
    isArray: true,
    type: [String],
  })
  @Column('text', { array: true })
  area_de_servicio: string[];

  @ApiProperty({
    description: 'Fecha y hora de la recepción',
    example: '2025-08-13T20:26:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Teléfono de contacto (opcional)',
    example: '+56912345678',
    required: false,
  })
  @Column({ nullable: true })
  telefono?: string;
}
