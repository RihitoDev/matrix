import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  escapeAnnotationData,
  getCommitMessageErrors,
} from './commit-message.ts';

function checkCommitMessages(): void {
  const [baseSha, headSha] = process.argv.slice(2);
  if (baseSha === '--message-file') {
    if (!headSha) {
      throw new Error('Se requiere la ruta del archivo del mensaje de commit.');
    }
    const message = readFileSync(headSha, 'utf8');
    const errors = getCommitMessageErrors(message);
    for (const error of errors) {
      console.error(`Mensaje de commit inválido: ${error}`);
    }
    if (errors.length > 0) process.exitCode = 1;
    return;
  }
  if (
    !baseSha ||
    !headSha ||
    !/^[a-f0-9]{40}$/i.test(baseSha) ||
    !/^[a-f0-9]{40}$/i.test(headSha)
  ) {
    throw new Error('Se requieren los SHA completos de base y head del PR.');
  }

  const output = execFileSync(
    'git',
    ['rev-list', '--reverse', '--no-merges', `${baseSha}..${headSha}`],
    { encoding: 'utf8' },
  ).trim();
  const commits = output ? output.split('\n') : [];

  let hasErrors = false;
  for (const sha of commits) {
    const message = execFileSync('git', ['show', '-s', '--format=%B', sha], {
      encoding: 'utf8',
    });
    for (const error of getCommitMessageErrors(message)) {
      hasErrors = true;
      console.error(
        `::error::${escapeAnnotationData(`Commit ${sha}: ${error} Mensaje: ${message.split('\n')[0]}`)}`,
      );
    }
  }

  if (hasErrors) {
    process.exitCode = 1;
  } else {
    console.log(`Se validaron ${commits.length} commits del PR.`);
  }
}

try {
  checkCommitMessages();
} catch (error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(
    `::error::${escapeAnnotationData(`No se pudo validar el rango del PR: ${detail}`)}`,
  );
  process.exitCode = 1;
}
