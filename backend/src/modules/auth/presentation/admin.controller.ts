import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ListUsersUseCase } from '../application/use-cases/list-users.usecase';
import { UpdateUserRoleUseCase } from '../application/use-cases/update-user-role.usecase';
import { UserRole } from '../domain/user-role.enum';
import { CurrentUser } from './current-user.decorator';
import type { AuthenticatedUser } from '../domain/auth-user.model';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AdminController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly updateUserRole: UpdateUserRoleUseCase,
  ) {}

  @Get('users')
  async getUsers() {
    return this.listUsers.execute();
  }

  @Patch('users/:id/role')
  async patchUserRole(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    return this.updateUserRole.execute(actor, id, body.role);
  }
}
