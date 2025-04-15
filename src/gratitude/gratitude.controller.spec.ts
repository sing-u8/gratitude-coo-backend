import { Test, TestingModule } from '@nestjs/testing';
import { GratitudeController } from './gratitude.controller';
import { GratitudeService } from './gratitude.service';

describe('GratitudeController', () => {
  let controller: GratitudeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GratitudeController],
      providers: [GratitudeService],
    }).compile();

    controller = module.get<GratitudeController>(GratitudeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
