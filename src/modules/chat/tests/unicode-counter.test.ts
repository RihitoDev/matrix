import { describe, it, expect } from 'vitest';
import {
  countCharacters,
  truncateToMaxCharacters,
  isWhitespaceOnly,
  isContentValidForSend,
  MAX_MESSAGE_LENGTH,
} from '../utils/unicode-counter';

// Generador dinamico de caracteres Unicode para pruebas (sin literales de emoji en codigo)
const fromCodePoints = (...codes: number[]) => String.fromCodePoint(...codes);
const EMOJI_SMILE = fromCodePoints(0x1f600);
const EMOJI_GRIN = fromCodePoints(0x1f603);
const EMOJI_LAUGH = fromCodePoints(0x1f604);
const EMOJI_THUMBS_UP = fromCodePoints(0x1f44d);
const EMOJI_FLAG_BO = fromCodePoints(0x1f1e7, 0x1f1f4);

describe('unicode-counter utility (HU-03 Tarea 4)', () => {
  describe('countCharacters', () => {
    it('debe retornar 0 para cadenas vacias', () => {
      expect(countCharacters('')).toBe(0);
    });

    it('debe contar caracteres alfanumericos estandar de forma exacta', () => {
      expect(countCharacters('Hola mundo')).toBe(10);
      expect(countCharacters('UMSS')).toBe(4);
    });

    it('debe contar cada emoji simple como exactamente 1 caracter', () => {
      expect(countCharacters(EMOJI_SMILE)).toBe(1);

      const threeEmojis = EMOJI_SMILE + EMOJI_GRIN + EMOJI_LAUGH;
      expect(countCharacters(threeEmojis)).toBe(3);
    });

    it('debe contar correctamente mezclas de texto y emojis', () => {
      const mixed = 'Hola ' + EMOJI_SMILE + ' UMSS ' + EMOJI_THUMBS_UP;
      // 'Hola ' (5) + emoji (1) + ' UMSS ' (6) + emoji (1) = 13
      expect(countCharacters(mixed)).toBe(13);
    });

    it('debe contar emojis con modificadores o banderas como 1 caracter', () => {
      expect(countCharacters(EMOJI_FLAG_BO)).toBe(1);
    });
  });

  describe('truncateToMaxCharacters', () => {
    it('debe retornar cadena vacia si el texto esta vacio o el limite es menor o igual a 0', () => {
      expect(truncateToMaxCharacters('', 500)).toBe('');
      expect(truncateToMaxCharacters('Hola', 0)).toBe('');
      expect(truncateToMaxCharacters('Hola', -5)).toBe('');
    });

    it('no debe truncar si la longitud es menor o igual al limite', () => {
      const text = 'Mensaje corto';
      expect(truncateToMaxCharacters(text, 500)).toBe(text);
    });

    it('debe truncar fielmente al numero exacto de caracteres sin cortar emojis', () => {
      const textWithEmojis = 'A' + EMOJI_SMILE + 'B' + EMOJI_GRIN + 'C';
      // Limitar a 3 caracteres: debe ser 'A' + emoji + 'B'
      const truncated = truncateToMaxCharacters(textWithEmojis, 3);
      expect(countCharacters(truncated)).toBe(3);
      expect(truncated).toBe('A' + EMOJI_SMILE + 'B');
    });

    it('debe truncar un texto que excede los 500 caracteres a exactamente 500', () => {
      const longText = 'a'.repeat(600);
      const truncated = truncateToMaxCharacters(longText, MAX_MESSAGE_LENGTH);
      expect(countCharacters(truncated)).toBe(500);
      expect(truncated.length).toBe(500);
    });

    it('debe truncar una coleccion de 300 emojis a un maximo de 500 sin desbordar', () => {
      const emojiRepeated = EMOJI_SMILE.repeat(300);
      expect(countCharacters(emojiRepeated)).toBe(300);
      const truncated = truncateToMaxCharacters(emojiRepeated, MAX_MESSAGE_LENGTH);
      expect(countCharacters(truncated)).toBe(300);
    });
  });

  describe('isWhitespaceOnly', () => {
    it('debe identificar cadenas vacias y con solo espacios', () => {
      expect(isWhitespaceOnly('')).toBe(true);
      expect(isWhitespaceOnly('   ')).toBe(true);
      expect(isWhitespaceOnly('\n\t  \r')).toBe(true);
    });

    it('debe retornar false si contiene caracteres validos', () => {
      expect(isWhitespaceOnly('a')).toBe(false);
      expect(isWhitespaceOnly('  b  ')).toBe(false);
      expect(isWhitespaceOnly(EMOJI_SMILE)).toBe(false);
    });
  });

  describe('isContentValidForSend', () => {
    it('debe invalidar strings vacios o de solo espacios', () => {
      expect(isContentValidForSend('')).toBe(false);
      expect(isContentValidForSend('   ')).toBe(false);
    });

    it('debe validar strings con al menos un caracter valido', () => {
      expect(isContentValidForSend('Hola')).toBe(true);
      expect(isContentValidForSend(EMOJI_SMILE)).toBe(true);
      expect(isContentValidForSend('  OK  ')).toBe(true);
    });

    it('debe invalidar strings que excedan el limite de 500 caracteres', () => {
      const exact500 = 'x'.repeat(500);
      expect(isContentValidForSend(exact500)).toBe(true);

      const exceeds501 = 'x'.repeat(501);
      expect(isContentValidForSend(exceeds501)).toBe(false);
    });
  });
});

