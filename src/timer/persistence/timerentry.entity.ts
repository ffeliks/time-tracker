import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/persistence/user.entity';

@Entity()
export class TimerEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(
    type => User,
    user => user.timerEntires,
  )
  user: User;

  @Column('datetime')
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column()
  duration: number;
}
