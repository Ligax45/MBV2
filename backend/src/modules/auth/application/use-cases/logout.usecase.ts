import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenService } from '../../infrastructure/token.service';

export interface LogoutInput {
  refreshToken?: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(input: LogoutInput) {
    const refreshToken = input.refreshToken?.trim();
    if (!refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }

    await this.tokenService.revokeRefreshToken(refreshToken);
    return { success: true };
  }
}
