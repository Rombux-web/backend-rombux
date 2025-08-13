import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from '../services/contact.service';

describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;

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
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on submit', async () => {
    const dto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@empresa.com',
      empresa: 'MiEmpresa S.A.',
      mensaje: 'Hola, me interesa el servicio.',
      area_de_servicio: ['Growth'],
    };
    await controller.submit(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll on findAll', async () => {
    await controller.findAll(1, 10);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });
});
