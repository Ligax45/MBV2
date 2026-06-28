export type UserRole = 'user' | 'moderator' | 'admin';

export interface AuthUser {
  id: string;
  pseudo: string;
  role: UserRole;
  mfaEnabled?: boolean;
}

export interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface MfaRequiredResponse {
  mfaRequired: true;
  mfaSessionToken: string;
}

export interface MfaSetupRequiredResponse {
  mfaSetupRequired: true;
  mfaSetupSessionToken: string;
}

export type AuthApiResponse =
  | AuthSuccessResponse
  | MfaRequiredResponse
  | MfaSetupRequiredResponse;

export interface LoginPayload {
  identifiant: string;
  password: string;
}

export interface RegisterPayload {
  identifiant: string;
  pseudo: string;
  password: string;
}

export interface MfaSetupResponse {
  secret: string;
  otpauthUri: string;
}

export function isAuthSuccessResponse(
  response: AuthApiResponse,
): response is AuthSuccessResponse {
  return 'accessToken' in response;
}

export function isMfaRequiredResponse(
  response: AuthApiResponse,
): response is MfaRequiredResponse {
  return 'mfaRequired' in response && response.mfaRequired === true;
}

export function isMfaSetupRequiredResponse(
  response: AuthApiResponse,
): response is MfaSetupRequiredResponse {
  return 'mfaSetupRequired' in response && response.mfaSetupRequired === true;
}
