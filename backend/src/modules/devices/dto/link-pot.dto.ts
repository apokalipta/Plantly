import { IsString, IsOptional, IsInt } from 'class-validator';

/**
 * DTO to link an existing physical pot (device) to the current user.
 */
export class LinkPotDto {
  @IsString()
  deviceUid!: string;

  @IsString()
  pairingCode!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  speciesId?: number;

  @IsOptional()
  @IsString()
  plantNickname?: string;
}

