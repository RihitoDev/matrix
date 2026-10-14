import { Injectable } from '@nestjs/common';

@Injectable()
export class NlpService {
  private static readonly STOPWORDS = new Set([
    'a', 'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'los', 'para', 'por', 'un', 'una', 'y'
  ]);

  private static readonly CLEAN_PUNCTUATION_REGEX = /[^\w\sñáéíóúü]/g;
  private static readonly MULTIPLE_SPACES_REGEX = /\s+/g;

  tokenizeAndFilter(text: string): string[] {
    if (!text) return [];
    
    const tokens = text.split(' ');
    const result: string[] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      if (word.length > 0 && !NlpService.STOPWORDS.has(word)) {
        result.push(word);
      }
    }
    return result;
  }

  normalizeText(text: string): string {
    if (!text) return '';

    return text
      .toLowerCase()
      .replace(NlpService.CLEAN_PUNCTUATION_REGEX, '')
      .replace(NlpService.MULTIPLE_SPACES_REGEX, ' ')
      .trim();
  }

  generateNGrams(tokens: string[]): string[] {
    const len = tokens.length;
    if (len < 2) return [];

    const ngrams: string[] = [];

    for (let i = 0; i < len - 1; i++) {
      ngrams.push(`${tokens[i]}_${tokens[i + 1]}`);
      
      if (i < len - 2) {
        ngrams.push(`${tokens[i]}_${tokens[i + 1]}_${tokens[i + 2]}`);
      }
    }

    return ngrams;
  }
}
