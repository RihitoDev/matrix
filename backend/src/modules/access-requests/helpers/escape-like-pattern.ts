const LIKE_SPECIAL_CHARACTERS = /[\\%_]/g;

export function escapeLikePattern(term: string): string {
  return term.replace(LIKE_SPECIAL_CHARACTERS, '\\$&');
}
