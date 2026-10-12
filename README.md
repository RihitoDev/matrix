This repository is organized as a monorepo. For specific setup instructions, scripts, and architecture details, please refer to the documentation for each workspace:

**[Frontend Documentation](./frontend/README.md)** – Next.js application, UI components, and client-side setup.

**[Backend Documentation](./backend/README.md)** – NestJS API, Prisma ORM, database migrations, and testing setup.

# Setup

## Prerequisites

Both the backend and frontend require **Node.js 22 (LTS)**. We recommend using **NVM** (Node Version Manager) to handle Node.js versions easily.

### 1. Install NVM

Follow the installation guide in the official [NVM Documentation](https://www.nvmnode.com/guide/download.html).

### 2. Set the Node.js Version

Every time you open a new terminal session (VS Code, CMD, or PowerShell) inside the project folder, run:

```bash
nvm use
```

> **Note:** If the specified Node.js version is not installed yet, NVM will prompt you to install it.

### 3. Install PNPM

This project uses **PNPM** as its package manager. Once Node.js is installed, you can install PNPM globally via NPM:

```bash
npm install -g pnpm
```
For alternative installation methods, check the [official PNPM installation guide](https://pnpm.io/installation).

### 4. install Docker

if you on in linux systems you can read here [CLI command installation](https://docs.docker.com/engine/install)

if you need GUI or have windows [Docker desktop](https://www.docker.com/products/docker-desktop/)

## Git hooks with Husky

The project uses Husky to run the linter only on the files you are about to commit.

### What it does

- If files under `frontend/` are staged, it runs `eslint --max-warnings=0` on the `.ts` and `.tsx` files.
- If files under `backend/` are staged, it runs `oxlint --type-aware` and `eslint` on the `.ts` files.
- If a check fails, the commit is blocked. Fix the error and commit again.

### How it is activated

The hook is installed automatically when you run `pnpm install` inside `frontend` or `backend` (the `prepare` script). The `.husky/` folder lives at the repository root and there is no `package.json` at the root.

To verify that it is active:

    git config core.hooksPath

It must print `.husky/_`.

### How to skip it

Only for exceptional cases. CI still checks the code in the pull request.

    git commit --no-verify -m "message"

You can also disable it with the environment variable `HUSKY=0`.

### Common problems on Windows

- Access denied (os error 5) during install: enable Windows Developer Mode and close any dev server, terminal or editor that has the `node_modules` folder open.
- The hook does not run when editing files from the GitHub web UI, only on local commits.