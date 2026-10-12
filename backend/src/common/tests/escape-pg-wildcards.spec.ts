import { describe, expect, it } from 'vitest';
import { escapePgWildcards } from '../utils/escape-pg-wildcards.js';

describe('escapePgWildcards', () => {
  it('escapes percent signs (%)', () => {
    expect(escapePgWildcards('100%')).toBe('100\\%');
    expect(escapePgWildcards('%%%')).toBe('\\%\\%\\%');
  });

  it('escapes underscores (_)', () => {
    expect(escapePgWildcards('user_name')).toBe('user\\_name');
    expect(escapePgWildcards('_')).toBe('\\_');
  });

  it('escapes backslashes (\\)', () => {
    expect(escapePgWildcards('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('leaves standard alphanumeric strings untouched', () => {
    expect(escapePgWildcards('Node.js Workshop 2026')).toBe('Node.js Workshop 2026');
  });
});
