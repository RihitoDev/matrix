import { Injectable } from '@nestjs/common';
import {
  institutionalDictionary,
  skillDictionary,
} from '../constants/skill-dictionary.js';

export function normalizeTerm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function detectTerms(
  text: string,
  entries: readonly { name: string; aliases: readonly string[] }[],
) {
  let remaining = text;
  const found = new Set<string>();
  const aliases = entries
    .flatMap((entry) =>
      entry.aliases.map((alias) => ({ name: entry.name, alias })),
    )
    .sort((a, b) => b.alias.length - a.alias.length);
  for (const { name, alias } of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}_+#])${escaped}(?![\\p{L}\\p{N}_+#])`,
      'gu',
    );
    remaining = remaining.replace(pattern, (match) => {
      found.add(name);
      return ' '.repeat(match.length);
    });
  }
  return entries.filter(({ name }) => found.has(name)).map(({ name }) => name);
}

@Injectable()
export class SkillDictionaryService {
  canonicalize(value: string): string {
    const normalized = normalizeTerm(value);
    const entry = skillDictionary.find(({ aliases }) =>
      aliases.some((alias) => alias === normalized),
    );
    return entry ? normalizeTerm(entry.name) : normalized;
  }

  extract(text: string) {
    const normalized = normalizeTerm(text);
    const skills = detectTerms(normalized, skillDictionary);
    const institutions = detectTerms(normalized, institutionalDictionary);
    return { skills, institutions };
  }
}
