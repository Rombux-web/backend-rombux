import { Module } from '@nestjs/common';
import { ContactPostEmailService } from './contact-post-email.service';

@Module({
  providers: [ContactPostEmailService],
  exports: [ContactPostEmailService],
})
export class ContactPostEmailModule {}
