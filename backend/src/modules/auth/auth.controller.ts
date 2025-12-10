// Contrôleur d'authentification: inscription, connexion, rafraîchissement, déconnexion et mot de passe.
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

  // Inscription: crée un compte et renvoie les jetons
  @Post('register')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: RegisterDto, examples: { example: { value: { email: 'user@example.com', password: 'Test1234!' } } } })
  @ApiCreatedResponse({ description: 'User registered successfully', type: TokenPairDto, schema: { example: { accessToken: 'xxx.yyy.zzz', refreshToken: 'aaa.bbb.ccc' } } })
  @ApiBadRequestResponse({ description: 'Email already in use or invalid input' })
  async register(@Body() dto: RegisterDto): Promise<TokenPairDto> {
    // Délégation au service pour validation, hachage et création
    return this.authService.register(dto);
  }

  // Connexion: vérifie identifiants et renvoie les jetons
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto, examples: { example: { value: { email: 'user@example.com', password: 'Test1234!' } } } })
  @ApiOkResponse({ description: 'Login successful', type: TokenPairDto, schema: { example: { accessToken: 'xxx', refreshToken: 'yyy' } } })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @HttpCode(200)
  async login(@Body() dto: LoginDto): Promise<TokenPairDto> {
    // Délégation au service pour vérification et génération de jetons
    return this.authService.login(dto);
  }

  // Rafraîchissement: renouvelle le couple de jetons via le refresh token
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh expired access token' })
  @ApiBody({ type: RefreshTokenDto, examples: { example: { value: { refreshToken: 'aaa.bbb.ccc' } } } })
  @ApiOkResponse({ description: 'New token pair returned', type: TokenPairDto, schema: { example: { accessToken: 'new-access', refreshToken: 'new-refresh' } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPairDto> {
    // Délégation au service pour valider et régénérer les jetons
    return this.authService.refreshTokens(dto);
  }

  // Déconnexion: invalide les jetons de l'utilisateur courant
  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user (invalidate all tokens)' })
  @ApiOkResponse({ description: 'Logged out', schema: { example: { status: 'ok' } } })
  @HttpCode(200)
  async logout(@CurrentUser() user: any): Promise<{ status: string }> {
    // Incrémente la version de jeton pour invalider les refresh tokens
    await this.authService.logout(user?.userId);
    return { status: 'ok' };
  }

  // Mot de passe oublié: demande d'envoi de lien de réinitialisation
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto, examples: { example: { value: { email: 'user@example.com' } } } })
  @ApiOkResponse({ description: 'If the email exists, a reset link is sent', schema: { example: { status: 'ok' } } })
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ status: string }> {
    // Délégation au service pour lancer le flux de réinitialisation
    await this.authService.requestPasswordReset(dto);
    return { status: 'ok' };
  }

  // Réinitialisation de mot de passe via jeton
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using provided token' })
  @ApiBody({ type: ResetPasswordDto, examples: { example: { value: { token: 'reset-token', newPassword: 'NewPass123!' } } } })
  @ApiOkResponse({ description: 'Password changed successfully', schema: { example: { status: 'ok' } } })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ status: string }> {
    // Valide le jeton et remplace le mot de passe
    await this.authService.resetPassword(dto);
    return { status: 'ok' };
  }
}
