// DTO générique de rafraîchissement (à étendre si nécessaire).
import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

