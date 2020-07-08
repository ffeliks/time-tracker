import {
  Controller,
  Post,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignInDto } from './dto/signin.dto';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @UsePipes(ValidationPipe)
  async signUp(
    @Body() payload: SignUpDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.authService.signUp(payload.email, payload.password);

    return res.json();
  }

  @Post('/signin')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  async signIn(
    @Body() payload: SignInDto,
    @Res() res: Response,
  ): Promise<Response> {
    const token = await this.authService.signIn(
      payload.email,
      payload.password,
    );

    return res.json({ token });
  }
}
