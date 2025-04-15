import { Test, TestingModule } from '@nestjs/testing';
import { GratitudeService } from './gratitude.service';

describe('GratitudeService', () => {
  let service: GratitudeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GratitudeService],
    }).compile();

    service = module.get<GratitudeService>(GratitudeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
