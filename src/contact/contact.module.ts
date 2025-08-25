import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactSubmission } from './entities/contact-submission.entity';
import { ContactService } from './services/contact.service';
import { ContactController } from './controllers/contact.controller';
import { ContactPostEmailModule } from '../email/contact-post-email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactSubmission]),
    ContactPostEmailModule, // Importa el módulo del servicio de email
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
