import { Test, TestingModule } from '@nestjs/testing';
import { LocationGateway } from './location.gateway';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

describe('LocationGateway', () => {
  let gateway: LocationGateway;
  let configService: ConfigService;
  let redisClient: Redis;
  let redisSubscriber: Redis;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'REDIS_HOST':
            return 'localhost';
          case 'REDIS_PORT':
            return 6379;
          case 'REDIS_PASSWORD':
            return 'password';
          default:
            return null;
        }
      }),
    } as unknown as ConfigService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationGateway,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    gateway = module.get<LocationGateway>(LocationGateway);

    const redisHost = configService.get<string>('REDIS_HOST');
    const redisPort = configService.get<number>('REDIS_PORT');

    redisClient = new Redis({
      host: redisHost,
      port: redisPort,
    });

    redisSubscriber = new Redis({
      host: redisHost,
      port: redisPort,
    });
  });

  afterEach(async () => {
    await redisClient.quit();
    await redisSubscriber.quit();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should initialize Redis clients', () => {
    expect(redisClient).toBeDefined();
    expect(redisSubscriber).toBeDefined();
  });

  it('should connect to Redis', async () => {
    await redisClient.set('test_key', 'test_value');
    const value = await redisClient.get('test_key');
    expect(value).toBe('test_value');
  });
});
