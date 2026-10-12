const ACCENT_GROUPS: Record<string, string> = {
  a: 'áàäâ',
  e: 'éèëê',
  i: 'íìïî',
  o: 'óòöô',
  u: 'úùüû',
  n: 'ñ',
};

const entries = Object.entries(ACCENT_GROUPS);

const TYPOGRAPHIC_APOSTROPHE = '’';

export const ACCENT_FOLD_FROM = entries.map(([, accented]) => accented + accented.toUpperCase()).join('') + TYPOGRAPHIC_APOSTROPHE;

export const ACCENT_FOLD_TO = entries.map(([base, accented]) => base.repeat(accented.length * 2)).join('') + "'";
