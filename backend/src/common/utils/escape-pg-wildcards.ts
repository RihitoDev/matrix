export function escapePgWildcards(term: string): string {
  return term.replace(/[%_\\]/g, '\\$&');
}
