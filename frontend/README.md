## Local Environment Setup

Node.js 22 and pnpm 12.4.2 are required. From the repository root, install
dependencies and prepare the environment file before starting the application,
adding components, or running the build:

```bash
cd frontend
pnpm install --frozen-lockfile
cp .env.example .env.local
```

If `.env.local` already exists, review its values without overwriting your configuration.
In PowerShell, the equivalent command to copy the example is
`Copy-Item .env.example .env.local`.

To use the local backend, `.env.local` must contain:

```dotenv
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_API_URL_LOCAL=http://localhost:8080/api
```

`NEXT_PUBLIC_APP_ENV` selects the environment (`local`, `dev`, or `prod`) and
defaults to `local` when omitted. The URL for the selected environment is
required both to start the application and to build it:

| Environment | Required Variable |
| --- | --- |
| `local` | `NEXT_PUBLIC_API_URL_LOCAL` |
| `dev` | `NEXT_PUBLIC_API_URL_DEV` |
| `prod` | `NEXT_PUBLIC_API_URL_PROD` |

The `dev` and `prod` URLs are empty in `.env.example`. Set the corresponding
backend URL if you select either environment. URLs for environments you are
not using can remain empty.
`.env.local` is ignored by Git; do not add it to the repository.

## Running and Building

After configuring `.env.local`, run the following commands from `frontend/`.
To start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. To lint
the code and build the application:

```bash
pnpm lint
pnpm build
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## UI Components (shadcn/ui)

This project uses [shadcn/ui](https://ui.shadcn.com) for UI components, built on top of Tailwind CSS.

### Initial Setup

shadcn/ui is already initialized in this project. If you need to set it up again from scratch, run:

```bash
pnpm dlx shadcn@latest init
```

When prompted, select:
- **Component library:** Base UI (Recommended)
- **Preset:** Nova (Lucide icons / Geist font)

This will generate `components.json`, `src/lib/utils.ts`, and update `src/app/globals.css` with the required Tailwind styles.

### Adding Components

To add a new component, run:

```bash
pnpm dlx shadcn@latest add <component-name>
```

For example, to add a button and a card:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
```

Components are added to `src/components/ui/`. You can browse all available components at [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).
