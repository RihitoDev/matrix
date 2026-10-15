import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : entry.name.endsWith('.ts') ? [path] : [];
  });
}

describe('Generated Prisma client regression (#1116)', () => {
  it('contains generated sources without unresolved Git conflict markers', () => {
    const files = sourceFiles(join(process.cwd(), 'src', 'prisma'));
    expect(files.length).toBeGreaterThan(0);
    const conflicts = files.filter((path) =>
      /^(?:<{7}(?:\s|$)|={7}\s*$|>{7}(?:\s|$)|\|{7}(?:\s|$))/m.test(readFileSync(path, 'utf8')),
    );
    expect(conflicts).toEqual([]);
  });
});
