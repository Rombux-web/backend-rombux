import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignSubmission } from './entities/campaign-submission.entity';
import { CampaignsService } from './services/campaigns.service';
import { CampaignsController } from './controllers/campaigns.controller';
import { ContactPostEmailModule } from '../email/contact-post-email.module'; // reusar módulo de email

@Module({
  imports: [
    TypeOrmModule.forFeature([CampaignSubmission]),
    ContactPostEmailModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
