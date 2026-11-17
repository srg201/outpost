# Outpost

Docs, canvas and an AI agent in one workspace. Plan in a document, sketch on a canvas, and let an agent turn ideas into diagrams.

## Stack

- **Next.js 16** (App Router, Cache Components, Turbopack) with React 19 and TypeScript
- **Tailwind CSS v4** and **shadcn/ui** (Base UI primitives, Hugeicons)
- **Clerk** for authentication
- **Supabase Postgres** as the database, accessed through **Prisma 7** (`@prisma/adapter-pg`)
- **next-themes** for light/dark mode

## Getting started

Requirements: **Node.js 20.19+** (22 recommended, see `.nvmrc`) and **pnpm**.

```bash
nvm use                 # switches to Node 22 from .nvmrc
pnpm install            # also generates the Prisma client
cp .env.example .env.local   # then fill in the values
pnpm dev                # http://localhost:3000
```

To open the dev server from a phone on the same network, use your computer's LAN address
(e.g. `http://192.168.x.x:3000`). `192.168.*.*` is allowed in `next.config.ts`.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript checks |
| `pnpm db:generate` | Regenerate the Prisma client into `src/generated/prisma` |
| `pnpm db:push` | Sync `prisma/schema.prisma` to the database |
| `pnpm db:rls` | Enable row level security on all tables (run after `db:push` adds a table) |
| `pnpm db:studio` | Browse the database in Prisma Studio |

## Project structure

```
src/
  actions/            Server actions (e.g. checkUser: sync the Clerk user to the DB)
  app/
    (main)/           Signed-in app: dashboard, workspaces
    sign-in, sign-up/ Clerk auth pages
    page.tsx          Landing page
    globals.css       Theme tokens and custom utilities
  components/
    landing/          Landing page sections
    web/              Site chrome: header, footer, logo, app shell
    ui/               shadcn/ui components (generated, avoid hand edits)
  lib/                prisma client, Supabase clients, utils
  proxy.ts            Clerk middleware; protects /dashboard and /workspace
prisma/
  schema.prisma       Data model
  sql/enable-rls.sql  Locks tables from the public Supabase Data API
```

## Database and security

- Prisma connects as the `postgres` role, which **bypasses row level security**. Always scope queries to the
  signed-in user (`auth().userId` / the `User` row) in server code.
- RLS is enabled on every table so the public Supabase Data API can't read or write them. New tables start
  with RLS **off**: add them to `prisma/sql/enable-rls.sql` and run `pnpm db:rls`.
- `src/lib/supabase/*` provides Supabase clients authenticated with the Clerk session, for features that need
  RLS policies (e.g. Realtime). Policies should match `auth.jwt()->>'sub'` against `"User"."clerkId"`.

## Custom CSS utilities

Defined in `src/app/globals.css`:

| Utility | Effect |
| --- | --- |
| `bg-topo` | Topographic contour background, theme-aware, faded at the edges |
| `survey-frame` | Amber corner marks just outside the element, like map crop marks |
| `scroll-tilt` | Starts tilted back, settles flat over the first 500px of scroll |
| `fade-up` | Fade/lift in on page load; stagger with `[--fade-delay:200ms]` |
| `reveal` | Fade/lift in as it scrolls into view; stagger with `[--reveal-offset:8%]` |

All motion respects `prefers-reduced-motion`, and scroll-driven effects fall back to static content in
browsers without scroll-driven animations.
