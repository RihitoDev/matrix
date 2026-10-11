export function trimFormValues<T extends Record<keyof T, string>>(values: T): T {
  return Object.fromEntries(
    Object.entries<string>(values).map(([key, value]) => [key, value.trim()]),
  ) as T;
}
