const LOGIN_PATH = '/connexion';

export function resolvePostAuthReturnUrl(
  returnUrl: string | null | undefined,
  currentUrl = '/',
): string {
  const raw = returnUrl?.trim() || '/';
  const pathOnly = raw.split('?')[0];
  const currentPath = currentUrl.split('?')[0];

  if (!pathOnly || pathOnly === '/' || pathOnly === LOGIN_PATH || pathOnly === currentPath) {
    return '/';
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function connexionRedirectQueryParams(
  currentUrl: string,
): { returnUrl: string } | undefined {
  const currentPath = currentUrl.split('?')[0];
  if (currentPath === LOGIN_PATH) {
    return undefined;
  }

  return { returnUrl: currentUrl };
}
