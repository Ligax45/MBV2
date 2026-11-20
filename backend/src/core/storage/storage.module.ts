import { Global, Module } from '@nestjs/common';
import { LocalImageStorageService } from './local-image-storage.service';
import { MediaController } from './media.controller';

@Global()
@Module({
  controllers: [MediaController],
  providers: [LocalImageStorageService],
  exports: [LocalImageStorageService],
})
export class StorageModule {}
