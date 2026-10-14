## Description

This repository contains the backend for the **UMSSY** application.

## Project Setup

1. Install dependencies:

```bash
pnpm install
```

2. Environment configuration:
   Create a `.env` file by copying the template file:

```bash
cp .env.example .env
```

> **Note:** For local development, using the default values in `.env` is sufficient. Feel free to update the environment variables as needed.

## Compile and Run the Project

### Run the API and Database with Docker

Run these commands after preparing `.env` as described above.
To start both services:

```bash
docker compose up -d --build
```

The API container runs with `NODE_ENV=production`. Its startup command applies
existing migrations with `prisma migrate deploy`, then runs the compiled API
with `node dist/main.js`. Compose does not mount the API source code or enable
watch mode. After changing API code, rebuild the image with
`docker compose up -d --build api`.

### Run the API Locally in Development Mode

Start only PostgreSQL, apply the migrations and generate Prisma Client, then run
NestJS locally in **watch mode**:

```bash
docker compose up -d postgres
pnpm migrate:apply
pnpm run start:dev
```

Use this option for automatic reloading when source files change. Keep the API
container stopped to avoid a port conflict; if you previously started all
services, run `docker compose stop api` before starting the local API.
For this setup, use `DB_HOST=localhost` and the published `DB_PORT` from `.env`.

You can visit the Swagger documentation at:

```
http://localhost:8080/docs
```

The API is available at:

```
http://localhost:8080/api
```

## Database Migrations

Ensure your database container is running before executing migration commands.

- **Apply existing migrations:**

```bash
pnpm migrate:apply
```

- **Generate a new migration** (if you modified `schema.prisma`):

```bash
pnpm migrate <migration_name>
```

- **Generate Prisma Client:**

```bash
pnpm generate
```

## Run Tests

```bash
# Unit tests
pnpm run test

# End-to-end (E2E) tests
pnpm run test:e2e

# Run unit and E2E tests in parallel
pnpm run test:all

# Test coverage report
pnpm run test:cov
```
## Testing

Before running the tests, start the local database with `docker compose up -d postgres` and apply the migrations to `.env` with `pnpm migrate:apply`.

Then create a `.env.test` file by copying `.env.test.example`. Use the same credentials as your `.env` (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`) and keep `DB_SCHEMA=test`, so tests use a separate schema and don't affect your development data.

   Apply the migrations to the test schema (only the first time, or when new migrations are added):

```bash
   pnpm migrate:test:apply
```

## Authentication

Login is provisional and works by role. The user sends email, password,
and the role they want to log in as (`roleTag`). The backend validates
the password and confirms the user has that role assigned before
returning a token.

Required environment variables in `.env`:

- `JWT_SECRET` — secret used to sign tokens. You can generate with `openssl rand -base64 32` and paste in `JWT_SECRET` in `.env`.

## Seed

After applying migrations, run `pnpm run seed`.

Seeds are idempotent and run in dependency order, with one transaction per module. A failure rolls back that module and stops execution; earlier modules remain committed.

`SEED_TRANSACTION_TIMEOUT_MS` sets the timeout per module (default: `120000` ms; range: `1–600000`).

   ## Resources
- [NestJS Documentation](https://docs.nestjs.com?utm_source=gemini) — Learn more about the framework.
- [NestJS Courses](https://courses.nestjs.com/?utm_source=gemini) — Official video courses for hands-on experience.
- [Prisma v7 Documentation](https://www.prisma.io/docs/orm/v7?utm_source=gemini) — Official ORM documentation.
