import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  escapeAnnotationData,
  getCommitMessageErrors,
} from './commit-message.ts';

void test('accept authorized types, scopes, breaking changes and multiline messages', () => {
  for (const type of [
    'docs',
    'feat',
    'fix',
    'perf',
    'refactor',
    'test',
    'build',
    'chore',
  ]) {
    assert.deepEqual(getCommitMessageErrors(`${type}: add qa fixture`), []);
  }
  for (const message of [
    'fix(frontend): correct qa fixture',
    'FEAT: add qa fixture',
    'feat!: change qa fixture',
    'feat(api)!: change qa fixture\n\nBREAKING CHANGE: remove old fixture',
    'docs: add qa guide\r\n\r\nAdditional context\r\n\r\nRefs: #17',
  ]) {
    assert.deepEqual(getCommitMessageErrors(message), []);
  }
});

void test('reject malformed headers, unauthorized types, empty subjects and unseparated bodies', () => {
  for (const message of [
    '',
    'update stuff',
    'feat:add qa fixture',
    'feat(): add qa fixture',
  ]) {
    assert.match(getCommitMessageErrors(message)[0], /^header-format:/);
  }
  assert.match(getCommitMessageErrors('ci: change pipeline')[0], /^type-enum:/);
  assert.match(getCommitMessageErrors('fix:   ')[0], /^subject-empty:/);
  assert.match(
    getCommitMessageErrors('fix( ): add fixture')[0],
    /^scope-empty:/,
  );
  assert.match(
    getCommitMessageErrors('fix: add fixture\nBody')[0],
    /^body-leading-blank:/,
  );
});

void test('escape Actions annotation command characters', () => {
  assert.equal(
    escapeAnnotationData('100%\r\n::warning::text'),
    '100%25%0D%0A::warning::text',
  );
});

const validatorPath = fileURLToPath(
  new URL('./check-commit-messages.ts', import.meta.url),
);

void test('validate local commit message files for the existing Husky hook', () => {
  const directory = mkdtempSync(join(tmpdir(), 'commit-message-hook-'));
  try {
    const messagePath = join(directory, 'COMMIT_EDITMSG');
    for (const [message, expectedStatus] of [
      ['feat(frontend): add qa fixture', 0],
      ['update stuff', 1],
    ] as const) {
      writeFileSync(messagePath, message);
      const result = spawnSync(
        process.execPath,
        [validatorPath, '--message-file', messagePath],
        { encoding: 'utf8' },
      );
      assert.equal(result.status, expectedStatus, result.stderr);
    }
    assert.equal(
      spawnSync(process.execPath, [validatorPath, '--message-file'], {
        encoding: 'utf8',
      }).status,
      1,
    );
    assert.equal(
      spawnSync(
        process.execPath,
        [validatorPath, '--message-file', join(directory, 'missing')],
        { encoding: 'utf8' },
      ).status,
      1,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createRepository() {
  const directory = mkdtempSync(join(tmpdir(), 'commit-message-test-'));
  function runGit(...args: string[]): string {
    return execFileSync('git', args, {
      cwd: directory,
      encoding: 'utf8',
    }).trim();
  }
  runGit('init', '--quiet');
  runGit('config', 'user.name', 'QA Fixture');
  runGit('config', 'user.email', 'qa@example.com');
  runGit('config', 'commit.gpgsign', 'false');
  runGit('config', 'core.hooksPath', '/dev/null');
  function createCommit(message: string): string {
    runGit('commit', '--quiet', '--allow-empty', '-m', message);
    return runGit('rev-parse', 'HEAD');
  }
  function runValidator(baseSha: string, headSha: string) {
    return spawnSync(process.execPath, [validatorPath, baseSha, headSha], {
      cwd: directory,
      encoding: 'utf8',
    });
  }
  return { directory, runGit, createCommit, runValidator };
}

void test('TC-DEVOPS-26: accept PR #17 and reject intermediate update stuff in PR #18', () => {
  const repository = createRepository();
  try {
    const baseSha = repository.createCommit('legacy base message');
    repository.createCommit('feat: add qa fixture');
    repository.createCommit('fix(frontend): correct qa fixture');
    const validHead = repository.createCommit('docs: update qa guide');
    const validResult = repository.runValidator(baseSha, validHead);
    assert.equal(validResult.status, 0, validResult.stderr);
    assert.match(validResult.stdout, /3 commits/);

    repository.runGit('checkout', '--quiet', '--detach', baseSha);
    repository.createCommit('docs: add qa note');
    const invalidSha = repository.createCommit('update stuff');
    const invalidHead = repository.createCommit('fix: correct qa note');

    repository.runGit('checkout', '--quiet', '-b', 'base-update', baseSha);
    const updatedBase = repository.createCommit('unrelated base message');
    repository.runGit(
      'merge',
      '--quiet',
      '--no-ff',
      invalidHead,
      '-m',
      'synthetic merge',
    );
    const invalidResult = repository.runValidator(updatedBase, invalidHead);
    assert.equal(invalidResult.status, 1);
    assert.match(
      invalidResult.stderr,
      new RegExp(`Commit ${invalidSha}: header-format:`),
    );
    assert.match(invalidResult.stderr, /update stuff/);
    assert.doesNotMatch(
      invalidResult.stderr,
      /unrelated base message|synthetic merge/,
    );
  } finally {
    rmSync(repository.directory, { recursive: true, force: true });
  }
});

void test('report every invalid commit, including first and last, and reject invalid ranges', () => {
  const repository = createRepository();
  try {
    const baseSha = repository.createCommit('chore: initialize fixture');
    const firstSha = repository.createCommit('update stuff');
    repository.createCommit('fix: correct qa note');
    const lastSha = repository.createCommit('ci: change pipeline');
    const result = repository.runValidator(baseSha, lastSha);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      new RegExp(`Commit ${firstSha}: header-format:`),
    );
    assert.match(result.stderr, new RegExp(`Commit ${lastSha}: type-enum:`));
    assert.equal(repository.runValidator(baseSha, baseSha).status, 0);
    assert.equal(repository.runValidator('invalid', lastSha).status, 1);
    assert.equal(repository.runValidator('0'.repeat(40), lastSha).status, 1);
  } finally {
    rmSync(repository.directory, { recursive: true, force: true });
  }
});

void test('ignore merge commits while validating normal commits from both parents', () => {
  const repository = createRepository();
  try {
    const baseSha = repository.createCommit('chore: initialize fixture');
    repository.runGit('checkout', '--quiet', '-b', 'pr-work');
    const firstSha = repository.createCommit('feat: add qa fixture');
    repository.runGit('checkout', '--quiet', '-b', 'side-work', baseSha);
    const sideSha = repository.createCommit('fix: correct qa fixture');
    repository.runGit('checkout', '--quiet', 'pr-work');
    repository.runGit(
      'merge',
      '--quiet',
      '--no-ff',
      sideSha,
      '-m',
      'Merge side-work',
    );
    const mergeSha = repository.runGit('rev-parse', 'HEAD');
    const validResult = repository.runValidator(baseSha, mergeSha);
    assert.equal(validResult.status, 0, validResult.stderr);
    assert.match(validResult.stdout, /2 commits/);

    repository.runGit('checkout', '--quiet', '-b', 'invalid-side', baseSha);
    const invalidSha = repository.createCommit('update stuff');
    repository.runGit('checkout', '--quiet', 'pr-work');
    repository.runGit('merge', '--quiet', '--no-ff', '--no-commit', invalidSha);
    const hookPath = fileURLToPath(
      new URL('../../.husky/commit-msg', import.meta.url),
    );
    const hookResult = spawnSync('sh', [hookPath, '.git/MERGE_MSG'], {
      cwd: repository.directory,
      encoding: 'utf8',
    });
    assert.equal(hookResult.status, 0, hookResult.stderr);
    repository.runGit('commit', '--quiet', '-m', 'Merge invalid-side');
    const invalidMergeSha = repository.runGit('rev-parse', 'HEAD');
    const invalidResult = repository.runValidator(baseSha, invalidMergeSha);
    assert.equal(invalidResult.status, 1);
    assert.match(
      invalidResult.stderr,
      new RegExp(`Commit ${invalidSha}: header-format:`),
    );
    assert.doesNotMatch(
      invalidResult.stderr,
      new RegExp(`${mergeSha}|${invalidMergeSha}|${firstSha}|${sideSha}`),
    );
  } finally {
    rmSync(repository.directory, { recursive: true, force: true });
  }
});
