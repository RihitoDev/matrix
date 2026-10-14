export function getCommitMessageErrors(message: string): string[] {
  const [header = '', secondLine] = message.split(/\r?\n/);
  const errors: string[] = [];
  const match = /^([a-z]+)(?:\(([^()\r\n]+)\))?(!)?: (.*)$/i.exec(header);

  if (!match) {
    errors.push(
      'header-format: se requiere <tipo>[scope opcional][!]: <descripción>.',
    );
  } else {
    if (
      ![
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'test',
        'build',
        'chore',
      ].includes(match[1].toLowerCase())
    ) {
      errors.push(
        'type-enum: tipos autorizados: docs, feat, fix, perf, refactor, test, build, chore.',
      );
    }
    if (!match[4].trim()) {
      errors.push('subject-empty: la descripción no puede estar vacía.');
    }
    if (match[2] !== undefined && !match[2].trim()) {
      errors.push('scope-empty: el scope no puede contener solo espacios.');
    }
  }

  if (secondLine !== undefined && secondLine.trim() !== '') {
    errors.push(
      'body-leading-blank: el cuerpo o pie debe separarse del encabezado con una línea vacía.',
    );
  }
  return errors;
}

export function escapeAnnotationData(value: string): string {
  return value
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A');
}
