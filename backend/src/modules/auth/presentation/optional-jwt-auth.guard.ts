import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ACCESS_COOKIE_NAME } from './auth-cookies';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      cookies?: Record<string, string | undefined>;
    }>();

    const hasBearer = !!request.headers.authorization;
    const hasAccessCookie = !!request.cookies?.[ACCESS_COOKIE_NAME]?.trim();

    if (!hasBearer && !hasAccessCookie) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser | undefined {
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
