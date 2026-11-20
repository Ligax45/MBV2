import {
  connexionRedirectQueryParams,
  resolvePostAuthReturnUrl,
} from './auth-navigation.util';

describe('auth-navigation.util', () => {
  it('accepte un chemin interne relatif', () => {
    expect(resolvePostAuthReturnUrl('/bibliotheque')).toBe('/bibliotheque');
  });

  it('refuse les open-redirects //evil', () => {
    expect(resolvePostAuthReturnUrl('//evil.example')).toBe('/');
    expect(resolvePostAuthReturnUrl('/\\evil.example')).toBe('/');
    expect(resolvePostAuthReturnUrl('https://evil.example')).toBe('/');
  });

  it('ignore returnUrl vers la page de connexion', () => {
    expect(resolvePostAuthReturnUrl('/connexion')).toBe('/');
  });

  it('ne redirige pas vers une URL courante non sûre', () => {
    expect(connexionRedirectQueryParams('//evil.example')).toBeUndefined();
    expect(connexionRedirectQueryParams('/recette/1')).toEqual({
      returnUrl: '/recette/1',
    });
  });
});
