// DTO mot de passe oublié: demande d'email de réinitialisation.
import { IsEmail } from 'class-validator';
export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

