import { Module } from '@nestjs/common';

import { JwtKeyService } from './jwt-key.service';

@Module({
  providers: [JwtKeyService],
  exports: [JwtKeyService],
})
export class JwtKeysModule {}
