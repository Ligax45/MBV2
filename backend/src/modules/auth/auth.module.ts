import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  UserOrmEntity,
  UserOrmEntitySchema,
} from '../recipe/infrastructure/mikroorm/user.orm-entity';
import { AuthSessionService } from './application/auth-session.service';
import { ConfirmMfaUseCase } from './application/use-cases/confirm-mfa.usecase';
import { DisableMfaUseCase } from './application/use-cases/disable-mfa.usecase';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.usecase';
import { ListUsersUseCase } from './application/use-cases/list-users.usecase';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { LogoutUseCase } from './application/use-cases/logout.usecase';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.usecase';
import { RegisterUseCase } from './application/use-cases/register.usecase';
import { SetupMfaUseCase } from './application/use-cases/setup-mfa.usecase';
import { UpdateUserRoleUseCase } from './application/use-cases/update-user-role.usecase';
import { VerifyMfaUseCase } from './application/use-cases/verify-mfa.usecase';
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { HashingService } from './infrastructure/hashing.service';
import { JwtKeyService } from './infrastructure/jwt-key.service';
import { JwtKeysModule } from './infrastructure/jwt-keys.module';
import { MfaService } from './infrastructure/mfa.service';
import {
  RefreshTokenOrmEntity,
  RefreshTokenOrmEntitySchema,
} from './infrastructure/mikroorm/refresh-token.orm-entity';
import { MikroOrmRefreshTokenRepository } from './infrastructure/repositories/refresh-token.repository.impl';
import { MikroOrmUserRepository } from './infrastructure/repositories/user.repository.impl';
import { TokenService } from './infrastructure/token.service';
import { AdminController } from './presentation/admin.controller';
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './presentation/optional-jwt-auth.guard';
import { JwtStrategy } from './presentation/jwt.strategy';
import { RolesGuard } from './presentation/roles.guard';
import { ACCESS_TOKEN_TTL } from './infrastructure/token.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      UserOrmEntitySchema,
      UserOrmEntity,
      RefreshTokenOrmEntitySchema,
      RefreshTokenOrmEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtKeysModule,
    JwtModule.registerAsync({
      imports: [JwtKeysModule],
      inject: [JwtKeyService],
      useFactory: (jwtKeys: JwtKeyService): JwtModuleOptions => ({
        privateKey: jwtKeys.privateKey,
        publicKey: jwtKeys.publicKey,
        signOptions: {
          algorithm: 'RS256',
          expiresIn: ACCESS_TOKEN_TTL,
        },
        verifyOptions: {
          algorithms: ['RS256'],
        },
      }),
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [
    HashingService,
    MfaService,
    TokenService,
    AuthSessionService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    VerifyMfaUseCase,
    SetupMfaUseCase,
    ConfirmMfaUseCase,
    DisableMfaUseCase,
    GetCurrentUserUseCase,
    ListUsersUseCase,
    UpdateUserRoleUseCase,
    JwtStrategy,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    RolesGuard,
    {
      provide: USER_REPOSITORY,
      useClass: MikroOrmUserRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: MikroOrmRefreshTokenRepository,
    },
  ],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, JwtModule, PassportModule],
})
export class AuthModule {}
