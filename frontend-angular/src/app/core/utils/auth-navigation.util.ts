const LOGIN_PATH = '/connexion';

function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith('/')) {
    return false;
  }
  // Bloque les open-redirects du type //evil.com ou /\evil
  if (path.startsWith('//') || path.startsWith('/\\')) {
    return false;
  }
  if (path.includes('://') || path.includes('\\')) {
    return false;
  }
  return true;
}

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

  if (!isSafeInternalPath(pathOnly)) {
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

  if (!isSafeInternalPath(currentPath)) {
    return undefined;
  }

  return { returnUrl: currentUrl };
}
