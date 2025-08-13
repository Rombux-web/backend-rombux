import { ApiProperty } from '@nestjs/swagger';
import { ContactSubmission } from '../entities/contact-submission.entity';

export class PaginatedContactSubmissionsDto {
  @ApiProperty({ type: [ContactSubmission] })
  data: ContactSubmission[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3, description: 'Última página disponible' })
  last_page: number;
}
