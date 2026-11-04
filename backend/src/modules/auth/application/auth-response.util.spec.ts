import {
  isAuthSuccessResponse,
  toAuthSuccessResponse,
  toPublicAuthSuccessResponse,
} from './auth-response.util';

describe('auth-response.util', () => {
  it('expose les tokens en interne puis les retire de la réponse publique', () => {
    const internal = toAuthSuccessResponse(
      { accessToken: 'a', refreshToken: 'r' },
      { id: '1', pseudo: 'bob', role: 'user', mfaEnabled: false },
    );

    expect(isAuthSuccessResponse(internal)).toBe(true);
    expect(internal.accessToken).toBe('a');

    const published = toPublicAuthSuccessResponse(internal);
    expect(published).toEqual({
      user: {
        id: '1',
        pseudo: 'bob',
        role: 'user',
        mfaEnabled: false,
      },
    });
    expect(published).not.toHaveProperty('accessToken');
    expect(published).not.toHaveProperty('refreshToken');
  });
});
