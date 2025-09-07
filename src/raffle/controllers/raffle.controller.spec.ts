import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from '../services/raffle.service';
import { RaffleParticipant } from '../entities/raffle-participant.entity';

describe('RaffleController', () => {
  let controller: RaffleController;
  let service: RaffleService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn((dto) =>
        Promise.resolve({ id: 1, ...dto, createdAt: new Date() }),
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
      controllers: [RaffleController],
      providers: [
        {
          provide: RaffleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RaffleController>(RaffleController);
    service = module.get<RaffleService>(RaffleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on participate', async () => {
    const dto = { email: 'controller@test.com' };
    await controller.participate(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll on findAll', async () => {
    await controller.findAll(1, 10);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });
});
