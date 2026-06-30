# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.16.1 create --template minimal --types ts --add tailwindcss="plugins:typography" --install bun ./goodlab
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Environment Variables

This app reads Better Auth settings from Cloudflare runtime bindings through `event.platform.env`.

Cloudflare's current Wrangler docs support local secrets in either `.env` or `.dev.vars`. This project uses `.env` only.

For local app secrets, copy `.env.example` to `.env` and fill in the values:

```sh
cp .env.example .env
```

Required local values:

```dotenv
BETTER_AUTH_SECRET="generate-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:5173"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

For production, set the same values as Cloudflare Worker secrets. These are not read from `.env` in production:

```sh
bunx wrangler secret put BETTER_AUTH_SECRET
bunx wrangler secret put BETTER_AUTH_URL
bunx wrangler secret put GITHUB_CLIENT_ID
bunx wrangler secret put GITHUB_CLIENT_SECRET
```

Use your production origin for `BETTER_AUTH_URL`, for example `https://your-domain.com`.

Configure these callback URLs in the GitHub OAuth app:

```txt
http://localhost:5173/api/auth/callback/github
https://your-domain.com/api/auth/callback/github
```

Do not commit `.env` or `.env.*` files. The committed `.env.example` file is a template only.

Do not create `.dev.vars` in this project. Wrangler gives `.dev.vars` precedence for local Worker secrets, which would prevent `.env` values from being included in the local Worker `env` object.

`.env.example` contains optional Cloudflare API variables for Wrangler automation or `drizzle-kit` D1 HTTP usage. You do not need a Cloudflare API token for normal local commands if you are already logged in with Wrangler.

The normal migration flow for this project is Wrangler-based:

```sh
bunx drizzle-kit generate
bunx wrangler d1 migrations apply goodlab-local --local
bunx wrangler d1 migrations apply goodlab-prod --env production --remote
```

The default configured D1 binding is `goodlab-local`, which is used with Wrangler's local D1 simulation. The production environment overrides the same `DB` binding to use the remote `goodlab-prod` database.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
