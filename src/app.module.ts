import { Module } from '@nestjs/common';
import { TimerModule } from './timer/timer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TimerModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sq3',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
