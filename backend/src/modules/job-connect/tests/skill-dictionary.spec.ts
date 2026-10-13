import { describe, expect, it } from 'vitest';
import { SkillDictionaryService } from '../services/skill-dictionary.service.js';

describe('UMSS dictionary (#223)', () => {
  const service = new SkillDictionaryService();
  it('recognizes technical punctuation and institutional aliases separately', () => {
    const result = service.extract('Universidad Mayor de San Simón: Python, C++, C#, .NET y Node.js');
    expect(result.institutions).toEqual(['UMSS']);
    expect(result.skills).toEqual(expect.arrayContaining(['Python', 'C++', 'C#', '.NET', 'Node.js']));
    expect(result.skills).not.toContain('UMSS');
  });
  it('deduplicates, handles accents and canonicalizes aliases', () => {
    expect(service.extract('Python PYTHON python').skills).toEqual(['Python']);
    expect(service.canonicalize(' JS ')).toBe('javascript');
    expect(service.canonicalize('Gestión Ágil')).toBe('gestion agil');
  });
  it.each(['', 'proactivo puntual pythones javabeans mysql c++17'])('rejects partial terms in %s', (text) => {
    expect(service.extract(text).skills).toEqual([]);
  });
});
