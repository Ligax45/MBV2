import { IsIn, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['user', 'moderator', 'admin'])
  role!: 'user' | 'moderator' | 'admin';
}
