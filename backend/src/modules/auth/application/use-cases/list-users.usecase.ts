import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async execute() {
    const users = await this.userRepo.findAll();
    return users.map((user) => ({
      id: user.id,
      pseudo: user.pseudo,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }));
  }
}
