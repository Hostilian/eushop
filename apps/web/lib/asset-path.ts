/**
 * Resolves static asset image paths dynamically to support both local development (http://localhost:3002)
 * and GitHub Pages static exports (where basePath is '/eushop').
 */
export function getAssetPath(path: string | undefined | null): string {
  if (!path) return '';

  // Return external or data URLs as-is
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH !== undefined
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : '/eushop';

  // Local development or empty basePath
  if (!basePath || basePath === '/') {
    return path.startsWith('/') ? path : `/${path}`;
  }

  // Already prefixed with basePath
  if (path.startsWith(basePath)) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}
