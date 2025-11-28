import { IsEmail, IsString } from 'class-validator';

/**
 * DTO for logging in with email and password.
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
