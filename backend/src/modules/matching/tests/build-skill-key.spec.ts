import { describe, expect, it } from 'vitest';
import { buildSkillKey } from '../utils/build-skill-key.js';

describe('buildSkillKey', () => {
  it.each([
    ['C++', 'c++'],
    ['C#', 'c#'],
    ['.NET', '.net'],
    ['Node.js', 'node.js'],
    ['  Machine   Learning ', 'machine_learning'],
    ['Diseño Web', 'diseno_web'],
    ['', ''],
  ])('convierte %o en %o', (value, expected) => {
    expect(buildSkillKey(value)).toBe(expected);
  });
});
