import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { TimerEntry } from '../../timer/persistence/timerentry.entity';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(
    type => TimerEntry,
    timerEntry => timerEntry.user,
  )
  timerEntires: TimerEntry[];
}
