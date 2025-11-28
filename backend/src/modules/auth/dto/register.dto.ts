import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO for registering a user with email and password.
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
