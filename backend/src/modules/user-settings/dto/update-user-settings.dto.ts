// DTO de mise à jour des paramètres utilisateur.
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  timezone?: string;
}

