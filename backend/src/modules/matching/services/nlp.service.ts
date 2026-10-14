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

  generateNGrams(tokens: string[]): string[] {
    const ngrams: string[] = [];

    for (let i = 0; i < tokens.length - 1; i++) {
      ngrams.push(`${tokens[i]}_${tokens[i + 1]}`);
    }

    for (let i = 0; i < tokens.length - 2; i++) {
      ngrams.push(`${tokens[i]}_${tokens[i + 1]}_${tokens[i + 2]}`);
    }

    return ngrams;
  }
}
