import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  // TODO: extend based on requirements
  @IsOptional()
  @IsString()
  displayName?: string;
}

