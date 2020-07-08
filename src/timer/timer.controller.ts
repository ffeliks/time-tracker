import {
  Controller,
  Post,
  Body,
  Res,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
  Get,
  ParseIntPipe,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StartDto } from './dto/start.dto';
import { Response } from 'express';
import { TimerService } from './timer.service';
import { UpdateDto } from './dto/update.dto';
import { TimerEntry } from './persistence/timerentry.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/persistence/user.entity';

@Controller('/timer')
@UseGuards(AuthGuard('jwt'))
export class TimerController {
  constructor(private timerService: TimerService) {}

  @Get('/list')
  async list(
    @GetUser() user: User,
    @Res() res: Response,
    @Query('title') title?: string,
  ): Promise<Response> {
    let timerEntries: TimerEntry[];

    if (title) {
      timerEntries = await this.timerService.findByUserIdWithTitle(
        user.id,
        title,
      );
    } else {
      timerEntries = await this.timerService.findByUserId(user.id);
    }

    return res.json(timerEntries);
  }

  @Post('/start')
  @UsePipes(ValidationPipe)
  async start(
    @GetUser() user: User,
    @Body() payload: StartDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.timerService.startTimerForUser(user, payload.title);
    return res.json();
  }

  @Post('/stop')
  @HttpCode(200)
  async stop(@GetUser() user: User, @Res() res: Response): Promise<Response> {
    await this.timerService.stopTimerForUser(user);
    return res.json();
  }

  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() payload: UpdateDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.timerService.update(
      user,
      id,
      payload.title,
      new Date(payload.startTime),
      payload.endTime ? new Date(payload.endTime) : undefined,
    );
    return res.json();
  }
}
