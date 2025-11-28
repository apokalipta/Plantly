import { IsEmail } from 'class-validator';

/**
 * DTO to request a password reset email.
 */
export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

