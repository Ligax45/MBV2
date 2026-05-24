import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './core/database/mikro-orm.config';
import { StorageModule } from './core/storage/storage.module';
import { RecipeModule } from './modules/recipe/recipe.module';

@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmConfig), StorageModule, RecipeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
