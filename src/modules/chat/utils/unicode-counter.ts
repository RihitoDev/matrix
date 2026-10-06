export const MAX_MESSAGE_LENGTH = 500;

/**
 * Cuenta el numero de caracteres percibidos (clusters de grafemas)
 * para garantizar que los emojis, modificadores de tono, banderas
 * y secuencias complejas cuenten exactamente como 1 caracter.
 */
export function countCharacters(text: string): number {
  if (!text) {
    return 0;
  }

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text)).length;
  }

  // Respaldo basado en puntos de codigo Unicode (evita dividir pares sustitutos)
  return Array.from(text).length;
}

/**
 * Trunca una cadena al maximo de caracteres Unicode especificado,
 * preservando la integridad de grafemas y emojis sin cortar secuencias.
 */
export function truncateToMaxCharacters(text: string, maxLength: number): string {
  if (!text || maxLength <= 0) {
    return '';
  }

  if (countCharacters(text) <= maxLength) {
    return text;
  }

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
    let count = 0;
    let result = '';

    for (const segment of segmenter.segment(text)) {
      if (count >= maxLength) {
        break;
      }
      result += segment.segment;
      count += 1;
    }

    return result;
  }

  const codePoints = Array.from(text);
  return codePoints.slice(0, maxLength).join('');
}

/**
 * Determina si el texto esta vacio o contiene unicamente espacios en blanco.
 */
export function isWhitespaceOnly(text: string): boolean {
  return text.trim().length === 0;
}

/**
 * Valida si un contenido cumple con los criterios para ser enviado:
 * no estar vacio, no ser solo espacios y no superar el limite de caracteres.
 */
export function isContentValidForSend(
  text: string,
  maxLength: number = MAX_MESSAGE_LENGTH
): boolean {
  if (isWhitespaceOnly(text)) {
    return false;
  }

  const count = countCharacters(text);
  return count > 0 && count <= maxLength;
}

