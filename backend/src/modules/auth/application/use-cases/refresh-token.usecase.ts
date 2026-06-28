import { BadRequestException, Injectable } from '@nestjs/common';
import { toAuthSuccessResponse } from '../auth-response.util';
import { TokenService } from '../../infrastructure/token.service';

export interface RefreshTokenInput {
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(input: RefreshTokenInput) {
    const refreshToken = input.refreshToken?.trim() ?? '';
    if (!refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }

    const tokens = await this.tokenService.refresh(refreshToken);
    return toAuthSuccessResponse(tokens, tokens.user);
  }
}
