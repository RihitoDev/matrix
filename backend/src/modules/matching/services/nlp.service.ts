import { Injectable } from '@nestjs/common';

@Injectable()
export class NlpService {
  tokenizeAndFilter(text: string): string[] {
    const stopwords = new Set([
      'a',
      'al',
      'con',
      'de',
      'del',
      'el',
      'en',
      'la',
      'las',
      'los',
      'para',
      'por',
      'un',
      'una',
      'y',
    ]);

    return text
      .split(/\s+/)
      .filter((word) => word.length > 0 && !stopwords.has(word));
  }

  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}


