import { describe, expect, it } from 'vitest';
import { decodeUploadFileName } from '../helpers/decode-upload-file-name.js';

const asReceivedFromMultipart = (name: string) => Buffer.from(name, 'utf8').toString('latin1');

describe('decodeUploadFileName', () => {
  it('deja intacto un nombre ASCII', () => {
    expect(decodeUploadFileName('titulo-lionel-messi.pdf')).toBe('titulo-lionel-messi.pdf');
  });

  it.each(['Título Peña.pdf', 'Diploma Núñez.jpg', 'ñandú.png', '⁂⁑Undertale⁑⁂.jfif.jpg'])(
    'recupera "%s" cuando llega como latin1',
    (name) => {
      expect(decodeUploadFileName(asReceivedFromMultipart(name))).toBe(name);
    },
  );

  it('no altera un nombre que ya está bien codificado', () => {
    expect(decodeUploadFileName('Título Peña.pdf')).toBe('Título Peña.pdf');
    expect(decodeUploadFileName('⁂⁑Undertale⁑⁂.jpg')).toBe('⁂⁑Undertale⁑⁂.jpg');
  });

  it('conserva un nombre latin1 que no es UTF-8 válido', () => {
    expect(decodeUploadFileName('Caña')).toBe('Caña');
  });
});
