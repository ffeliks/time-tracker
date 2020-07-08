import { Repository, EntityRepository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('u')
      .where('u.email = :email', { email })
      .getOne();
  }
}
