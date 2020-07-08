import { IsNotEmpty, IsString } from 'class-validator';

export class StartDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
