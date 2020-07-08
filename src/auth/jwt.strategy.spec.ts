import { Test } from '@nestjs/testing';
import { UserRepository } from './persistence/user.repository';
import { User } from './persistence/user.entity';
import { JwtStrategy } from './jwt.strategy';

const mockUser: User = {
  id: 1,
  email: 'john.doe@example.com',
  password: 'secret',
  timerEntires: [],
};

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = (await module.get<UserRepository>(
      UserRepository,
    )) as jest.Mocked<UserRepository>;
  });

  describe('validate', () => {
    it('returns user when user id in payload is valid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate({ userId: 1 });

      expect(result).toEqual(mockUser);
    });

    it('throws error when user ID inside payload is invalid', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(jwtStrategy.validate({ userId: 1 })).rejects.toEqual(
        new Error('Unauthorized'),
      );
    });
  });
});
