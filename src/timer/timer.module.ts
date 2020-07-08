import { Module } from '@nestjs/common';
import { TimerController } from './timer.controller';
import { TimerService } from './timer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimerEntryRepository } from './persistence/timerentry.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TimerController],
  providers: [TimerService],
  imports: [AuthModule, TypeOrmModule.forFeature([TimerEntryRepository])],
})
export class TimerModule {}
