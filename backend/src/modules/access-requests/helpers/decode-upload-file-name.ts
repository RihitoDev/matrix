const LATIN1_MAX_CODE_POINT = 0xff;
const REPLACEMENT_CHARACTER = '�';

export function decodeUploadFileName(name: string): string {
  const isLatin1 = Array.from(name).every((char) => (char.codePointAt(0) ?? 0) <= LATIN1_MAX_CODE_POINT);
  if (!isLatin1) return name;

  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return decoded.includes(REPLACEMENT_CHARACTER) ? name : decoded;
}
