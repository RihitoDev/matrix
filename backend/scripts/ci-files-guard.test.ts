import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

void test('TC-DEVOPS-11: protect package commands and preserve CI guard branch rules', () => {
  const workflow = readFileSync(
    new URL('../../.github/workflows/pr-standards.yml', import.meta.url),
    'utf8',
  );
  const guardStep = workflow.slice(
    workflow.indexOf('      - name: Block CI changes outside DevOps branches'),
  );
  const runBlock = /        run: \|\n((?: {10}[^\n]*(?:\n|$)|\n)+)/.exec(
    guardStep,
  );
  assert.ok(runBlock, 'El workflow debe contener el guard de archivos de CI.');
  // Ejecuta el bloque real del workflow para evitar duplicar su lista de archivos.
  const guardScript = runBlock[1].replace(/^ {10}/gm, '');
  const directory = mkdtempSync(join(tmpdir(), 'ci-files-guard-'));

  function runGit(...args: string[]): string {
    return execFileSync('git', args, {
      cwd: directory,
      encoding: 'utf8',
    }).trim();
  }

  function writeFixture(path: string, content: string): void {
    const filePath = join(directory, path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  }

  function createCommit(): string {
    runGit('add', '.');
    runGit('commit', '--quiet', '-m', 'test: update qa fixture');
    return runGit('rev-parse', 'HEAD');
  }

  try {
    runGit('init', '--quiet');
    runGit('config', 'user.name', 'QA Fixture');
    runGit('config', 'user.email', 'qa@example.com');
    runGit('config', 'commit.gpgsign', 'false');
    runGit('config', 'core.hooksPath', '/dev/null');
    writeFixture(
      'backend/package.json',
      JSON.stringify({ scripts: { 'test:cov': 'vitest run --coverage' } }),
    );
    writeFixture(
      'frontend/package.json',
      JSON.stringify({ scripts: { 'test:coverage': 'vitest run --coverage' } }),
    );
    const baseSha = createCommit();

    function runGuard(headSha: string, branch = 'feature/grupo-1-script-test') {
      return spawnSync('bash', ['-e', '-c', guardScript], {
        cwd: directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          HEAD_REF: branch,
          BASE_SHA: baseSha,
          HEAD_SHA: headSha,
        },
      });
    }

    for (const [path, content, expectedStatus] of [
      [
        'backend/package.json',
        JSON.stringify({
          scripts: {
            'test:cov': `node -e "console.log('QA fixture: zero tests and no coverage')"`,
          },
        }),
        1,
      ],
      [
        'frontend/package.json',
        JSON.stringify({
          scripts: { 'test:coverage': 'node -e "process.exit(0)"' },
        }),
        1,
      ],
      ['.github/fixture.txt', 'QA fixture', 1],
      ['backend/scripts/fixture.ts', 'export {};', 1],
      ['frontend/src/fixture.ts', 'export {};', 0],
    ] as const) {
      runGit('checkout', '--quiet', '--detach', baseSha);
      writeFixture(path, content);
      const headSha = createCommit();
      const result = runGuard(headSha);
      assert.equal(
        result.status,
        expectedStatus,
        result.stdout + result.stderr,
      );
      if (expectedStatus === 1) {
        assert.match(
          result.stdout,
          /::error::Only DevOps branches can modify CI and scripts\./,
        );
        assert.ok(result.stdout.includes(path), `Debe reportar ${path}.`);
      }
      for (const branch of [
        'chore/devops-ci-guard',
        'fix/devops-ci-guard',
        'develop',
      ]) {
        const authorizedResult = runGuard(headSha, branch);
        assert.equal(
          authorizedResult.status,
          0,
          authorizedResult.stdout + authorizedResult.stderr,
        );
      }

      if (path === 'backend/package.json') {
        const stubResult = spawnSync('npm', ['run', 'test:cov'], {
          cwd: join(directory, 'backend'),
          encoding: 'utf8',
        });
        assert.equal(stubResult.status, 0, stubResult.stderr);
        assert.match(
          stubResult.stdout,
          /QA fixture: zero tests and no coverage/,
        );
      }
    }
    assert.notEqual(runGuard('0'.repeat(40)).status, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
