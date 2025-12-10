// DTO de réinitialisation: nouveau mot de passe via jeton.
import { IsString, MinLength } from 'class-validator';
export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
