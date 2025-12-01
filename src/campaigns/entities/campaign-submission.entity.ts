import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { tr } from '@faker-js/faker/.';

@Entity('campaign_submissions')
export class CampaignSubmission {
  @ApiProperty({ example: 1, description: 'ID único' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'ebook_TransDigital',
    description: 'Nombre de la campaña',
  })
  @Column()
  campaign: string;

  @ApiProperty({
    description: 'Payload original enviado por el front (JSON)',
    type: 'object',
    additionalProperties: true,
  })
  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @ApiProperty({ example: '127.0.0.1', required: false })
  @Column({ nullable: true })
  ip?: string;

  @ApiProperty({ example: 'Mozilla/5.0 ...', required: false })
  @Column({ nullable: true })
  user_agent?: string;

  @ApiProperty({ example: 'web', description: 'Origen', required: false })
  @Column({ nullable: true })
  source?: string;

  @ApiProperty({ example: false, description: 'Procesado por backend' })
  @Column({ default: false })
  processed: boolean;

  @ApiProperty({ example: null, required: false })
  @Column({ type: 'timestamptz', nullable: true })
  processed_at?: Date;

  @ApiProperty({ description: 'Fecha y hora de recepción' })
  @CreateDateColumn({ type: 'timestamptz' })
  received_at: Date;

  @ApiProperty({ description: 'Última actualización' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
