import { Repository, EntityRepository, SelectQueryBuilder } from 'typeorm';
import { TimerEntry } from './timerentry.entity';

@EntityRepository(TimerEntry)
export class TimerEntryRepository extends Repository<TimerEntry> {
  findInProgressForUserId(userId: number): Promise<TimerEntry | undefined> {
    return this.createQueryBuilder('te')
      .where('te.userId = :userId', { userId })
      .andWhere('te.endTime IS NULL')
      .getOne();
  }

  findByUserId(userId: number): Promise<TimerEntry[]> {
    return this.getFindByUserIdBaseQuery(userId).getMany();
  }

  findByUserIdWithTitle(userId: number, title: string): Promise<TimerEntry[]> {
    return this.getFindByUserIdBaseQuery(userId)
      .andWhere('LOWER(te.title) LIKE LOWER(:title)', { title: `%${title}%` })
      .getMany();
  }

  getFindByUserIdBaseQuery(userId: number): SelectQueryBuilder<TimerEntry> {
    return this.createQueryBuilder('te')
      .where('te.userId = :userId', { userId })
      .orderBy('te.startTime', 'DESC');
  }
}
