import { IsString } from 'class-validator';

/**
 * DTO carrying a refresh token to request new access/refresh tokens.
 */
export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

