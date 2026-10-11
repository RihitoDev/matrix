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

1. **Start the required services using Docker:**
To spin up all services—including the NestJS API and PostgreSQL database (API runs in **development mode** by default) and runs migrations too:
```bash
docker compose up -d
```


If you only need to run the PostgreSQL database (you need to run migrations after), run:
```bash
docker compose up postgres -d
```

2. **Start the application in development mode:**
Run the server in **watch mode** to enable auto-reloading whenever code changes are saved:
```bash
pnpm run start:dev
```

you can visit the Swagger documentation in:
```
http://localhost:8080/docs
```

and the server runs in:
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

<!-- TODO: modificar readme para cumplir con la configuracion y runs de los seeds -->
   ## Resources
- [NestJS Documentation](https://docs.nestjs.com?utm_source=gemini) — Learn more about the framework.
- [NestJS Courses](https://courses.nestjs.com/?utm_source=gemini) — Official video courses for hands-on experience.
- [Prisma v7 Documentation](https://www.prisma.io/docs/orm/v7?utm_source=gemini) — Official ORM documentation.
