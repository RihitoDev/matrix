const REQUIRED_ENV_VARS = ['JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_ALGORITHM', 'CORS_ORIGIN'] as const;

export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in your .env file (see .env.example).',
    );
  }
}
