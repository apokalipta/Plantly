import { IsString } from 'class-validator';

export class RefreshDto {
  // TODO: extend based on requirements
  @IsString()
  refreshToken!: string;
}

