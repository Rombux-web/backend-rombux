import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampaignSubmission } from '../entities/campaign-submission.entity';
import { Repository } from 'typeorm';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let repo: Repository<CampaignSubmission>;

  const baseDto = {
    campaign: 'ebook_TransDigital',
    payload: { nombre: 'Test', apellido: 'User', email: 'test@empresa.com' },
    captchaToken: 'test-captcha',
    source: 'web',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getRepositoryToken(CampaignSubmission),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    repo = module.get<Repository<CampaignSubmission>>(
      getRepositoryToken(CampaignSubmission),
    );
  });

  describe('create', () => {
    it('should create a campaign submission successfully', async () => {
      const saved = {
        id: 1,
        campaign: baseDto.campaign,
        payload: baseDto.payload,
        ip: '::1',
        user_agent: 'agent',
        source: 'web',
        processed: false,
        received_at: new Date(),
        updated_at: new Date(),
      } as CampaignSubmission;

      jest.spyOn(repo, 'create').mockReturnValue(saved);
      jest.spyOn(repo, 'save').mockResolvedValue(saved);

      const result = await service.create({
        ...baseDto,
        ip: '::1',
        user_agent: 'agent',
      });
      expect(result).toEqual(saved);
    });

    it('should throw when repo.save throws', async () => {
      const contact = {
        campaign: baseDto.campaign,
        payload: baseDto.payload,
      } as CampaignSubmission;

      jest.spyOn(repo, 'create').mockReturnValue(contact);
      jest.spyOn(repo, 'save').mockRejectedValue(new Error('db error'));

      await expect(
        service.create({ ...baseDto, ip: '::1', user_agent: 'agent' }),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const items = [
        {
          id: 1,
          campaign: baseDto.campaign,
          payload: baseDto.payload,
          received_at: new Date(),
        },
      ] as CampaignSubmission[];

      jest.spyOn(repo, 'findAndCount').mockResolvedValue([items, 1]);

      const res = await service.findAll(1, 10);
      expect(res).toHaveProperty('data');
      expect(res.total).toBe(1);
      expect(res.page).toBe(1);
    });

    it('should throw on invalid pagination params', async () => {
      await expect(service.findAll(Number.NaN, 10)).rejects.toThrow();
      await expect(service.findAll(1, Number.NaN)).rejects.toThrow();
      await expect(service.findAll(0, 10)).rejects.toThrow();
      await expect(service.findAll(1, 101)).rejects.toThrow();
    });
  });
});
