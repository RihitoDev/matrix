export function isRouteActive(
  pathname: string,
  href: string,
  activePathPatterns: readonly RegExp[] = [],
): boolean {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    activePathPatterns.some((pattern) => pattern.test(pathname))
  );
}
