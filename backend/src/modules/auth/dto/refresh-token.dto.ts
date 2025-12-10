// DTO de rafraîchissement: contient le refresh token.
import { IsString } from 'class-validator';
export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

