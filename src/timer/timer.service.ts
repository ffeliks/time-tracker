import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { TimerEntry } from './persistence/timerentry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TimerEntryRepository } from './persistence/timerentry.repository';
import { User } from 'src/auth/persistence/user.entity';

@Injectable()
export class TimerService {
  private logger = new Logger('TimerService');

  constructor(
    @InjectRepository(TimerEntryRepository)
    private timerEntryRepository: TimerEntryRepository,
  ) {}

  findByUserId(userId: number): Promise<TimerEntry[]> {
    return this.timerEntryRepository.findByUserId(userId);
  }

  findByUserIdWithTitle(userId: number, title: string): Promise<TimerEntry[]> {
    return this.timerEntryRepository.findByUserIdWithTitle(userId, title);
  }

  async startTimerForUser(user: User, title: string): Promise<void> {
    await this.validateStartTimerForUser(user);

    const timerEntry = new TimerEntry();
    timerEntry.title = title;
    timerEntry.user = user;
    timerEntry.startTime = new Date();
    (timerEntry.endTime = null), (timerEntry.duration = 0);

    await this.timerEntryRepository.save(timerEntry);

    this.logger.log(`Started timer for user ID ${user.id}`);
  }

  async stopTimerForUser(user: User): Promise<void> {
    const inProgressTimer = await this.timerEntryRepository.findInProgressForUserId(
      user.id,
    );

    if (!inProgressTimer) {
      throw new BadRequestException(
        'User does not have an in progress timer entry',
      );
    }

    const endTime = new Date();

    inProgressTimer.endTime = endTime;
    inProgressTimer.duration = this.getDateDiffInSeconds(
      new Date(inProgressTimer.startTime),
      endTime,
    );

    await this.timerEntryRepository.save(inProgressTimer);

    this.logger.log(`Stopped timer for user ID ${user.id}`);
  }
  async update(
    user: User,
    timerEntryId: number,
    title: string,
    startTime: Date,
    endTime?: Date,
  ): Promise<void> {
    const timerEntry = await this.timerEntryRepository.findOne(timerEntryId, {
      relations: ['user'],
    });

    if (!timerEntry) {
      throw new BadRequestException(
        `Timer entry with id ${timerEntryId} not found`,
      );
    }

    if (timerEntry.user.id !== user.id) {
      throw new BadRequestException(
        'Cannot update a time entry that belongs to another user',
      );
    }

    let duration = 0;

    if (endTime) {
      this.validateDatesForUpdate(startTime, endTime);

      duration = this.getDateDiffInSeconds(startTime, endTime);
    } else {
      await this.validateStartTimerForUser(user);
    }

    timerEntry.title = title;
    timerEntry.startTime = startTime;
    timerEntry.endTime = endTime ? endTime : null;
    timerEntry.duration = duration;

    this.timerEntryRepository.save(timerEntry);
  }

  private async validateStartTimerForUser(user: User): Promise<void> {
    const inProgressTimer = await this.timerEntryRepository.findInProgressForUserId(
      user.id,
    );

    if (inProgressTimer) {
      throw new BadRequestException('User already has a running timer entry');
    }
  }

  private validateDatesForUpdate(startTime: Date, endTime: Date): void {
    const startMillis = startTime.getTime();
    const endMillis = endTime.getTime();

    if (startMillis === endMillis) {
      throw new BadRequestException(
        'End time cannot be the same as start time',
      );
    }

    if (endMillis < startMillis) {
      throw new BadRequestException(
        'Start time cannot be greater than end time',
      );
    }
  }

  private getDateDiffInSeconds(startDate: Date, endDate: Date): number {
    // TODO: find a better way to get the diff - this seems to be off by 1 sec (but not always)
    return Math.trunc((endDate.getTime() - startDate.getTime()) / 1000);
  }
}
