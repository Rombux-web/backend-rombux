import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('raffle_participants')
export class RaffleParticipant {
  @ApiProperty({
    description: 'ID único del participante',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Correo electrónico único del participante',
    example: 'usuario@ejemplo.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Fecha y hora en que el participante fue registrado',
    example: '2024-06-11T21:16:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}
