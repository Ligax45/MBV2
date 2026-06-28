export enum UserRole {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
}

export const USER_ROLES = Object.values(UserRole);

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}
