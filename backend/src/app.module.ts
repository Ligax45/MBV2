import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './core/database/mikro-orm.config';
import { StorageModule } from './core/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { CsrfOriginMiddleware } from './modules/auth/presentation/csrf-origin.middleware';
import { RecipeModule } from './modules/recipe/recipe.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    MikroOrmModule.forRoot(mikroOrmConfig),
    StorageModule,
    AuthModule,
    RecipeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CsrfOriginMiddleware).forRoutes('*');
  }
}
