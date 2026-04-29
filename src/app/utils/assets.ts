export function resolvePublicAssetPath(path: string) {
  if (path === "" || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  const baseUrl = import.meta.env.BASE_URL;

  if (path.startsWith(baseUrl)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${baseUrl}${normalizedPath}`;
}
