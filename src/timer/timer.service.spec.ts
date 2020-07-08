import { Test } from '@nestjs/testing';
import { TimerService } from './timer.service';
import { TimerEntryRepository } from './persistence/timerentry.repository';
import { User } from '../auth/persistence/user.entity';
import { TimerEntry } from './persistence/timerentry.entity';

const mockUser: User = {
  id: 1,
  email: 'john.doe@example.com',
  password: 'secret',
  timerEntires: [],
};

const mockTaskRepository = () => ({
  findByUserId: jest.fn(),
  findByUserIdWithTitle: jest.fn(),
  findInProgressForUserId: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

describe('TimerService', () => {
  let timerService: TimerService;
  let timerEntryRepository: jest.Mocked<TimerEntryRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TimerService,
        { provide: TimerEntryRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    timerService = await module.get<TimerService>(TimerService);
    timerEntryRepository = (await module.get<TimerEntryRepository>(
      TimerEntryRepository,
    )) as jest.Mocked<TimerEntryRepository>;
  });

  describe('get timer entries', () => {
    it('uses timerEntryRepository.findByUserId to find timer entries for user', () => {
      expect(timerEntryRepository.findByUserId).not.toHaveBeenCalled();

      timerService.findByUserId(1);

      expect(timerEntryRepository.findByUserId).toHaveBeenCalledTimes(1);
    });

    it('uses timerEntryRepository.findByUserIdWithTitle to find timer entries for user with title', () => {
      expect(timerEntryRepository.findByUserIdWithTitle).not.toHaveBeenCalled();

      timerService.findByUserIdWithTitle(1, 'example');

      expect(timerEntryRepository.findByUserIdWithTitle).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('start timer', () => {
    it('starts a timer for user', async () => {
      expect(timerEntryRepository.save).not.toHaveBeenCalled();

      await timerService.startTimerForUser(mockUser, 'Start working');

      expect(timerEntryRepository.save).toHaveBeenCalledTimes(1);
    });

    it('throws an error when user already has a running timer', async () => {
      timerEntryRepository.findInProgressForUserId.mockResolvedValue(
        new TimerEntry(),
      );

      expect.assertions(1);

      await expect(
        timerService.startTimerForUser(mockUser, 'Start working'),
      ).rejects.toEqual(new Error('User already has a running timer entry'));
    });
  });

  describe('stop timer', () => {
    it('stops a running timer', async () => {
      timerEntryRepository.findInProgressForUserId.mockResolvedValue(
        new TimerEntry(),
      );

      expect(timerEntryRepository.save).not.toHaveBeenCalled();

      await timerService.stopTimerForUser(mockUser);

      expect(timerEntryRepository.save).toHaveBeenCalledTimes(1);
    });

    it('throws an error when user does not have a running timer', async () => {
      timerEntryRepository.findInProgressForUserId.mockResolvedValue(null);

      expect.assertions(1);

      await expect(timerService.stopTimerForUser(mockUser)).rejects.toEqual(
        new Error('User does not have an in progress timer entry'),
      );
    });
  });

  describe('update timer entry', () => {
    it('timer entry be updated without end time', async () => {
      const mockTimerEntry = new TimerEntry();
      mockTimerEntry.user = mockUser;
      timerEntryRepository.findOne.mockResolvedValue(mockTimerEntry);

      expect(timerEntryRepository.save).not.toHaveBeenCalled();

      await timerService.update(mockUser, 1, 'new title', new Date());

      expect(timerEntryRepository.save).toHaveBeenCalledTimes(1);
    });

    it('timer entry be updated with end time', async () => {
      const mockTimerEntry = new TimerEntry();
      mockTimerEntry.user = mockUser;
      timerEntryRepository.findOne.mockResolvedValue(mockTimerEntry);

      expect(timerEntryRepository.save).not.toHaveBeenCalled();

      const startTime = new Date('2020-07-08 20:00:00');
      const endTime = new Date('2020-07-08 21:00:00');

      await timerService.update(mockUser, 1, 'new title', startTime, endTime);

      expect(timerEntryRepository.save).toHaveBeenCalledTimes(1);
    });

    it('throws error when timer entry is not found', async () => {
      timerEntryRepository.findOne.mockResolvedValue(null);

      expect.assertions(1);

      await expect(
        timerService.update(mockUser, 99, 'new title', new Date()),
      ).rejects.toEqual(new Error('Timer entry with id 99 not found'));
    });

    it('throws error when timer entry belongs to another user', async () => {
      const mockUser2 = new User();
      mockUser2.id = 2;

      const mockTimerEntry = new TimerEntry();
      mockTimerEntry.user = mockUser2;
      timerEntryRepository.findOne.mockResolvedValue(mockTimerEntry);

      expect.assertions(1);

      await expect(
        timerService.update(mockUser, 1, 'new title', new Date()),
      ).rejects.toEqual(
        new Error('Cannot update a time entry that belongs to another user'),
      );
    });

    it('throws error when end time is null and user already has a running timer', async () => {
      const mockTimerEntry = new TimerEntry();
      mockTimerEntry.user = mockUser;

      timerEntryRepository.findOne.mockResolvedValue(mockTimerEntry);
      timerEntryRepository.findInProgressForUserId.mockResolvedValue(
        new TimerEntry(),
      );

      expect.assertions(1);

      await expect(
        timerService.update(mockUser, 1, 'new title', new Date()),
      ).rejects.toEqual(new Error('User already has a running timer entry'));
    });

    it('throws error when end time is the same as start time', async () => {
      const mockTimerEntry = new TimerEntry();
      mockTimerEntry.user = mockUser;

      timerEntryRepository.findOne.mockResolvedValue(mockTimerEntry);
      timerEntryRepository.findInProgressForUserId.mockResolvedValue(
        new TimerEntry(),
      );

      const startTime = new Date();

      expect.assertions(1);

      await expect(
        timerService.update(mockUser, 1, 'new title', startTime, startTime),
      ).rejects.toEqual(new Error('End time cannot be the same as start time'));
    });

    it('throws error when start time is greater than end time', async () => {
      const mockTimerEntry = new TimerEntry();
      mockTimerEntry.user = mockUser;

      timerEntryRepository.findOne.mockResolvedValue(mockTimerEntry);
      timerEntryRepository.findInProgressForUserId.mockResolvedValue(
        new TimerEntry(),
      );

      const startTime = new Date('2020-07-08 20:00:00');
      const endTime = new Date('2020-07-08 19:59:59');

      expect.assertions(1);

      await expect(
        timerService.update(mockUser, 1, 'new title', startTime, endTime),
      ).rejects.toEqual(
        new Error('Start time cannot be greater than end time'),
      );
    });
  });
});
