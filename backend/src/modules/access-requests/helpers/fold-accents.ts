import { ACCENT_FOLD_FROM, ACCENT_FOLD_TO } from '../constants/accent-folding.constants.js';

export function foldAccents(text: string): string {
  return Array.from(text.normalize('NFC').toLowerCase(), (char) => {
    const index = ACCENT_FOLD_FROM.indexOf(char);
    return index === -1 ? char : ACCENT_FOLD_TO[index];
  }).join('');
}
