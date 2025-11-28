import { IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  // TODO: extend based on requirements
  @IsOptional()
  @IsString()
  timezone?: string;
}

