import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from './persistence/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './persistence/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string): Promise<void> {
    await this.validateEmailForSignup(email);

    const salt = await bcrypt.genSalt();

    const user = new User();
    user.email = email;
    user.password = await this.hashPassword(password, salt);

    this.logger.log(`Created a new user with email ${user.email}`);

    await this.userRepository.save(user);
  }

  async signIn(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      userId: user.id,
    };

    this.logger.log(`Successful login with email ${user.email}`);

    return this.jwtService.sign(payload);
  }

  private async hashPassword(password: string, hash: string) {
    return bcrypt.hash(password, hash);
  }

  private async validateEmailForSignup(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('An user with this email already exists');
    }
  }
}
