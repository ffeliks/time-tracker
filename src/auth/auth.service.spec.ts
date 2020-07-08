import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from './persistence/user.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from './persistence/user.entity';

const mockUser: User = {
  id: 1,
  email: 'john.doe@example.com',
  password: '$2b$10$b9aWl.h7vegzFXO/oCwLm./HamBIca9.IARrHB1mIw6N7OxuIHNFO', // secret
  timerEntires: [],
};

const mockUserRepository = () => ({
  findByEmail: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    userRepository = (await module.get<UserRepository>(
      UserRepository,
    )) as jest.Mocked<UserRepository>;
    jwtService = (await module.get<JwtService>(JwtService)) as jest.Mocked<
      JwtService
    >;
  });

  describe('sign up', () => {
    it('a new user can sign up', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      expect(userRepository.save).not.toHaveBeenCalled();

      await authService.signUp('john.doe@example.com', 'secret');

      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('throws an error when user with given email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(new User());

      expect.assertions(1);

      await expect(
        authService.signUp('john.doe@example.com', 'secret'),
      ).rejects.toEqual(new Error('An user with this email already exists'));
    });
  });

  describe('sign in', () => {
    it('user can sign in', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      expect(jwtService.sign).toHaveBeenCalledTimes(0);

      await authService.signIn('john.doe@example.com', 'secret');

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
    });

    it('throws an error when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      expect.assertions(1);

      await expect(
        authService.signIn('john.doe@example.com', 'non-matching-password'),
      ).rejects.toEqual(new Error('Unauthorized'));
    });
  });
});
