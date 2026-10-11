export function isRouteActive(
  pathname: string,
  href: string,
  activePathPatterns: RegExp[] = [],
): boolean {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    activePathPatterns.some((pattern) => pattern.test(pathname))
  );
}
