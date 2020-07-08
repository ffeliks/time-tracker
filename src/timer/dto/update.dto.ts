import { IsNotEmpty, IsString, IsISO8601, IsOptional } from 'class-validator';

export class UpdateDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsISO8601({strict: true})
    startTime: string;

    @IsOptional()
    @IsNotEmpty()
    @IsISO8601({strict: true})
    endTime: string;
}