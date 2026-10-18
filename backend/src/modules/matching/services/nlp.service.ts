import { Injectable } from '@nestjs/common';

@Injectable()
export class NlpService {
  private static readonly STOPWORDS = new Set([
    'a', 'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'los', 'para', 'por', 'un', 'una', 'y',
    'e', 'o', 'u', 'lo', 'le', 'les', 'se', 'su', 'sus', 'que', 'sin', 'sobre', 'como', 'muy',
    'unas', 'unos', 'es', 'son', 'ser', 'ha', 'han',
    'the', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'with', 'an', 'is', 'are',
  ]);

  private static readonly CLEAN_PUNCTUATION_REGEX = /[^\w\sñáéíóúü]/g;
  private static readonly MULTIPLE_SPACES_REGEX = /\s+/g;
  private static readonly TOKEN_SEPARATOR_REGEX = /[\s,;:!?()[\]{}"'¿¡/|\\•·*]+/u;
  private static readonly LEADING_NOISE_REGEX = /^[^\p{L}\p{N}.]+/u;
  private static readonly TRAILING_NOISE_REGEX = /[^\p{L}\p{N}+#]+$/u;
  private static readonly LEADING_DOT_REGEX = /^\.(?![\p{L}])/u;

  tokenizeAndFilter(text: string): string[] {
    if (!text) return [];

    const parts = text.normalize('NFC').toLowerCase().split(NlpService.TOKEN_SEPARATOR_REGEX);
    const result: string[] = [];

    for (const part of parts) {
      const token = part
        .replace(NlpService.LEADING_NOISE_REGEX, '')
        .replace(NlpService.LEADING_DOT_REGEX, '')
        .replace(NlpService.TRAILING_NOISE_REGEX, '');
      if (token.length > 0 && !NlpService.STOPWORDS.has(token)) {
        result.push(token);
      }
    }
    return result;
  }

  extractRequirementTerms(text: string): string[] {
    const tokens = this.tokenizeAndFilter(text);
    return [...new Set([...tokens, ...this.generateNGrams(tokens)])];
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
