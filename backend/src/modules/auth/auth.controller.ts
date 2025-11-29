import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: RegisterDto, examples: { example: { value: { email: 'user@example.com', password: 'Test1234!' } } } })
  @ApiCreatedResponse({ description: 'User registered successfully', type: TokenPairDto, schema: { example: { accessToken: 'xxx.yyy.zzz', refreshToken: 'aaa.bbb.ccc' } } })
  @ApiBadRequestResponse({ description: 'Email already in use or invalid input' })
  async register(@Body() dto: RegisterDto): Promise<TokenPairDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto, examples: { example: { value: { email: 'user@example.com', password: 'Test1234!' } } } })
  @ApiOkResponse({ description: 'Login successful', type: TokenPairDto, schema: { example: { accessToken: 'xxx', refreshToken: 'yyy' } } })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @HttpCode(200)
  async login(@Body() dto: LoginDto): Promise<TokenPairDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh expired access token' })
  @ApiBody({ type: RefreshTokenDto, examples: { example: { value: { refreshToken: 'aaa.bbb.ccc' } } } })
  @ApiOkResponse({ description: 'New token pair returned', type: TokenPairDto, schema: { example: { accessToken: 'new-access', refreshToken: 'new-refresh' } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPairDto> {
    return this.authService.refreshTokens(dto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user (invalidate all tokens)' })
  @ApiOkResponse({ description: 'Logged out', schema: { example: { status: 'ok' } } })
  @HttpCode(200)
  async logout(@CurrentUser() user: any): Promise<{ status: string }> {
    await this.authService.logout(user?.userId);
    return { status: 'ok' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto, examples: { example: { value: { email: 'user@example.com' } } } })
  @ApiOkResponse({ description: 'If the email exists, a reset link is sent', schema: { example: { status: 'ok' } } })
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ status: string }> {
    await this.authService.requestPasswordReset(dto);
    return { status: 'ok' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using provided token' })
  @ApiBody({ type: ResetPasswordDto, examples: { example: { value: { token: 'reset-token', newPassword: 'NewPass123!' } } } })
  @ApiOkResponse({ description: 'Password changed successfully', schema: { example: { status: 'ok' } } })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ status: string }> {
    await this.authService.resetPassword(dto);
    return { status: 'ok' };
  }
}
