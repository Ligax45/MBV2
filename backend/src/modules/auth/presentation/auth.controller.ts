import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConfirmMfaUseCase } from '../application/use-cases/confirm-mfa.usecase';
import { DisableMfaUseCase } from '../application/use-cases/disable-mfa.usecase';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { LogoutUseCase } from '../application/use-cases/logout.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';
import { RegisterUseCase } from '../application/use-cases/register.usecase';
import { SetupMfaUseCase } from '../application/use-cases/setup-mfa.usecase';
import { VerifyMfaUseCase } from '../application/use-cases/verify-mfa.usecase';
import { CurrentUser } from './current-user.decorator';
import type { AuthenticatedUser } from '../domain/auth-user.model';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
    private readonly verifyMfa: VerifyMfaUseCase,
    private readonly setupMfa: SetupMfaUseCase,
    private readonly confirmMfa: ConfirmMfaUseCase,
    private readonly disableMfa: DisableMfaUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  @Post('register')
  async registerUser(
    @Body() body: { identifiant: string; pseudo: string; password: string },
  ) {
    return this.register.execute(body);
  }

  @Post('login')
  async loginUser(@Body() body: { identifiant: string; password: string }) {
    return this.login.execute(body);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.refreshToken.execute(body);
  }

  @Post('logout')
  async logoutUser(@Body() body: { refreshToken: string }) {
    return this.logout.execute(body);
  }

  @Post('mfa/verify')
  async verifyMfaCode(
    @Body() body: { mfaSessionToken: string; totpCode: string },
  ) {
    return this.verifyMfa.execute(body);
  }

  /** Configuration MFA pour un compte sensible (session temporaire post-login). */
  @Post('mfa/setup-required')
  async setupMfaRequired(@Body() body: { mfaSetupSessionToken: string }) {
    return this.setupMfa.execute({
      mfaSetupSessionToken: body.mfaSetupSessionToken,
    });
  }

  /** Configuration MFA volontaire (utilisateur déjà authentifié). */
  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  async setupMfaAuthenticated(@CurrentUser() user: AuthenticatedUser) {
    return this.setupMfa.execute({ userId: user.id });
  }

  /** Confirmation MFA pour compte sensible — délivre les tokens finaux. */
  @Post('mfa/confirm-required')
  async confirmMfaRequired(
    @Body() body: { mfaSetupSessionToken: string; totpCode: string },
  ) {
    return this.confirmMfa.execute({
      mfaSetupSessionToken: body.mfaSetupSessionToken,
      totpCode: body.totpCode,
    });
  }

  /** Confirmation MFA volontaire (utilisateur déjà authentifié). */
  @Post('mfa/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmMfaAuthenticated(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { totpCode: string },
  ) {
    return this.confirmMfa.execute({
      userId: user.id,
      totpCode: body.totpCode,
    });
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  async disableMfaForUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { password: string; totpCode: string },
  ) {
    return this.disableMfa.execute({
      userId: user.id,
      password: body.password,
      totpCode: body.totpCode,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.getCurrentUser.execute(user.id);
  }
}
