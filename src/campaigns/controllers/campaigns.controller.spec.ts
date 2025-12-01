import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from '../services/campaigns.service';

// Mock de la función de validación de reCAPTCHA
jest.mock('../../contact/utils/recaptcha', () => ({
  validateRecaptcha: jest.fn().mockResolvedValue(true),
}));

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let service: CampaignsService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn((dto) =>
        Promise.resolve({ id: 1, ...dto, received_at: new Date() }),
      ),
      findAll: jest.fn(() =>
        Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          last_page: 1,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
    service = module.get<CampaignsService>(CampaignsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on submit', async () => {
    const dto = {
      campaign: 'ebook_TransDigital',
      payload: { nombre: 'Juan', apellido: 'Pérez', email: 'juan@example.com' },
      captchaToken: 'test-captcha',
    };
    await controller.submit(dto as any);
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should call service.findAll on findAll', async () => {
    await controller.findAll(1, 10);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });
});
