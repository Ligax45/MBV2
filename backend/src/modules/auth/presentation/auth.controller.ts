import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import {
  isAuthSuccessResponse,
  toPublicAuthSuccessResponse,
} from '../application/auth-response.util';
import { ConfirmMfaUseCase } from '../application/use-cases/confirm-mfa.usecase';
import { DisableMfaUseCase } from '../application/use-cases/disable-mfa.usecase';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { LogoutUseCase } from '../application/use-cases/logout.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';
import { RegisterUseCase } from '../application/use-cases/register.usecase';
import { SetupMfaUseCase } from '../application/use-cases/setup-mfa.usecase';
import { VerifyMfaUseCase } from '../application/use-cases/verify-mfa.usecase';
import type { AuthenticatedUser } from '../domain/auth-user.model';
import {
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  setAuthCookies,
} from './auth-cookies';
import { CurrentUser } from './current-user.decorator';
import {
  LoginDto,
  MfaConfirmDto,
  MfaConfirmRequiredDto,
  MfaDisableDto,
  MfaSetupRequiredDto,
  MfaVerifyDto,
  RegisterDto,
} from './dto/auth.dto';
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
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async registerUser(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.register.execute(body);
    return this.attachAuthCookies(res, result);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async loginUser(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.login.execute(body);
    return this.attachAuthCookies(res, result);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ?? '';
    const result = await this.refreshToken.execute({ refreshToken });
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return toPublicAuthSuccessResponse(result);
  }

  @Post('logout')
  async logoutUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ?? '';
    const result = await this.logout.execute({ refreshToken });
    clearAuthCookies(res);
    return result;
  }

  @Post('mfa/verify')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyMfaCode(
    @Body() body: MfaVerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.verifyMfa.execute(body);
    return this.attachAuthCookies(res, result);
  }

  /** Configuration MFA pour un compte sensible (session temporaire post-login). */
  @Post('mfa/setup-required')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async setupMfaRequired(@Body() body: MfaSetupRequiredDto) {
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
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async confirmMfaRequired(
    @Body() body: MfaConfirmRequiredDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.confirmMfa.execute({
      mfaSetupSessionToken: body.mfaSetupSessionToken,
      totpCode: body.totpCode,
    });
    return this.attachAuthCookies(res, result);
  }

  /** Confirmation MFA volontaire (utilisateur déjà authentifié). */
  @Post('mfa/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmMfaAuthenticated(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: MfaConfirmDto,
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
    @Body() body: MfaDisableDto,
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

  private attachAuthCookies<T>(res: Response, result: T): T | { user: unknown } {
    if (isAuthSuccessResponse(result as never)) {
      const success = result as {
        accessToken: string;
        refreshToken: string;
        user: unknown;
      };
      setAuthCookies(res, success.accessToken, success.refreshToken);
      return toPublicAuthSuccessResponse(success as never);
    }
    return result;
  }
}
