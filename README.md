## Storypress

A rich publishing platform built with **Next.js App Router**, **NextAuth**, **Prisma**, and **React Query**. Storypress covers the full Phase 2 readiness brief: authentication, rich text editing, post lifecycle, social interactions, SEO-friendly routing, and deploy-ready quality gates.

### Highlights

- Credential-based auth with protected routes, session-aware navigation, and middleware guards.
- Prisma-backed content models for posts, comments, likes, tags, and followers stored in SQLite (can be swapped for Postgres).
- Rich writing experience powered by Jodit, Cloudinary/local media uploads, live previews, draft / publish workflow, tag management, and reading-time heuristics.
- Feed, tag explorer, search, author hubs, post detail experience with threaded comments and optimistic React Query hooks.
- Comprehensive API surface (`/api/posts`, `/api/profile`, `/api/follow`, `/api/media/upload`) with zod validation and Prisma queries.
- TypeScript-first components, React Query provider, shared utilities, and Jest + Testing Library coverage for critical UI.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file (or export the variables in your shell) with:

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="replace-me"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
```

> If you don’t have Cloudinary credentials, leave the `NEXT_PUBLIC_CLOUDINARY_*` values empty and the editor will fall back to the local `/api/media/upload` route (files land in `public/uploads`).

### 3. Generate Prisma client & sync schema

```bash
npx prisma migrate deploy   # or `prisma db push` for dev
npx prisma generate
```

SQLite is the default for local development. Swap `DATABASE_URL` for Postgres/Supabase when you’re ready for production and run `prisma migrate deploy`.

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the experience: public marketing home, Explore search, tag hub, author profiles, editor, and dashboard.

---

## Available scripts

| Command        | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `npm run dev`  | Start Next.js in development mode                                      |
| `npm run build`| Production build (runs type/lint checks)                               |
| `npm start`    | Serve the production build                                             |
| `npm run lint` | ESLint (Next config)                                                   |
| `npm test`     | Jest + Testing Library (jsdom)                                         |

---

## Project structure

```
src/
  app/                # App Router routes (marketing, auth, editor, API)
  components/         # Layout, auth, post + comment widgets, providers
  lib/                # Prisma client, auth config, helpers, validators
  types/              # Shared TypeScript contracts
prisma/               # Schema + migrations (SQLite by default)
public/uploads/       # Local asset uploads for drafts/posts
```

Key flows:

- `src/app/api/posts` – CRUD, filtering, pagination, likes, comments.
- `src/app/api/profile` – author dashboards and public bios.
- `src/app/api/follow` – follow/unfollow toggle.
- `src/app/editor/page.tsx` – Jodit-based editor with Cloudinary/local uploads.
- `src/app/dashboard/page.tsx` – author analytics, drafts, publish stats.
- `src/app/posts/[slug]` – SEO-friendly story page with threaded comments.

---

## Testing

Jest is configured through `jest.config.ts` with Next.js helpers. Tests live under `__tests__/`.

```bash
npm test
```

Add additional component or integration tests as the surface grows (e.g., CommentThread interactions, feed pagination).

---

## Deployment notes

- Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`, and any Cloudinary keys in Vercel’s dashboard.
- Enable **Prisma Accelerate** or connection pooling for serverless databases.
- `next build && next start` should pass locally before deploying.
- Configure analytics/error reporting (Vercel Analytics, Sentry) as needed.

Happy publishing! Contributions and enhancements for additional social features, analytics, or editor extensions are welcome.
