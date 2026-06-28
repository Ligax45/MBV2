export interface AuthUserResponse {
  id: string;
  pseudo: string;
  role: string;
  mfaEnabled: boolean;
}

export interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface MfaRequiredResponse {
  mfaRequired: true;
  mfaSessionToken: string;
}

export interface MfaSetupRequiredResponse {
  mfaSetupRequired: true;
  mfaSetupSessionToken: string;
}

export type AuthResponse =
  | AuthSuccessResponse
  | MfaRequiredResponse
  | MfaSetupRequiredResponse;

export function toAuthSuccessResponse(
  tokens: { accessToken: string; refreshToken: string },
  user: {
    id: string;
    pseudo: string;
    role: string;
    mfaEnabled?: boolean;
  },
): AuthSuccessResponse {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      pseudo: user.pseudo,
      role: user.role,
      mfaEnabled: user.mfaEnabled ?? false,
    },
  };
}

export function toMfaRequiredResponse(
  mfaSessionToken: string,
): MfaRequiredResponse {
  return {
    mfaRequired: true,
    mfaSessionToken,
  };
}

export function toMfaSetupRequiredResponse(
  mfaSetupSessionToken: string,
): MfaSetupRequiredResponse {
  return {
    mfaSetupRequired: true,
    mfaSetupSessionToken,
  };
}

export function isAuthSuccessResponse(
  response: AuthResponse,
): response is AuthSuccessResponse {
  return 'accessToken' in response;
}
