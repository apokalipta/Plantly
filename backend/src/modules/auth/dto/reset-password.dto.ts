import { IsString, MinLength } from 'class-validator';

/**
 * DTO for resetting password using a token.
 */
export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
