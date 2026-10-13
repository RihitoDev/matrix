const DIACRITICS_REGEX = /[̀-ͯ]/g;

export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS_REGEX, "").toLowerCase().trim();
}
