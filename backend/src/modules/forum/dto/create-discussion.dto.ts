import { IsString, MinLength } from 'class-validator';

export class CreateDiscussionDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;
}

