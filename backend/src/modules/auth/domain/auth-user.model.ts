import { UserRole } from './user-role.enum';

export interface JwtPayload {
  sub: string;
  pseudo?: string;
  role?: string;
  typ?: string;
}

export interface AuthenticatedUser {
  id: string;
  pseudo: string;
  role: UserRole;
}
