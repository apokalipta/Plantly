// DTO de liaison: associe un pot (appareil) à l'utilisateur.
import { IsString, IsOptional, IsInt } from 'class-validator';
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

