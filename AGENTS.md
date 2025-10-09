# Repository Guidelines

## Project Structure & Module Organization
- `src/routes/`: SvelteKit routes and pages (UI). Co-locate page tests.
- `src/lib/`: shared code and assets; `src/lib/server/**` is server-only (auth, DB).
- `src/lib/server/db/schema.ts`: Drizzle ORM schema (PostgreSQL). Migrations output to `drizzle/`.
- `static/`: static assets served as-is.
- Config: `svelte.config.js`, `vite.config.ts`, `eslint.config.js`, `drizzle.config.ts`.
- Env: `.env` (see `.env.example`); `DATABASE_URL` is required.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server.
- `npm run build` — build production bundle.
- `npm run preview` — preview the production build.
- `npm run check` — Svelte + TypeScript type checks.
- `npm run lint` — Prettier check and ESLint.
- `npm run format` — auto-format the repo.
- `npm run test` — run Vitest (node + browser projects).
- `npm run db:generate|db:push|db:migrate|db:studio` — Drizzle migrations and studio (requires `DATABASE_URL`).

## Coding Style & Naming Conventions
- Language: TypeScript + Svelte 5. Tabs for indentation, single quotes, `printWidth` 100 (see `.prettierrc`).
- Keep server-only code under `src/lib/server/**`; never import it from client code.
- Filenames: kebab-case for modules (`nice-pathways.ts`), Svelte Kit conventions for routes (`+page.svelte`, `+layout.svelte`).
- Naming: `camelCase` for variables/functions, `PascalCase` for types/interfaces.

## Testing Guidelines
- Framework: Vitest with browser (Playwright) and node environments (`vite.config.ts`).
- File patterns: `*.{test,spec}.{ts,js}` and `**/*.svelte.{test,spec}.{ts,js}`.
- Place tests next to source files; prefer small, focused assertions. Run with `npm run test`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` (e.g., `feat(auth): renew session on request`).
- Keep subjects ≤ 72 chars; add scope when helpful.
- PRs must include: purpose/summary, test plan (commands run), screenshots for UI changes, linked issues, and notes on migrations or env changes. Ensure `npm run lint && npm run test && npm run build` pass.

## Security & Configuration Tips
- Required: `DATABASE_URL` in `.env`. Example: `cp .env.example .env` then edit.
- Do not commit secrets; `.env` is ignored by Git. Avoid logging sensitive data in `src/lib/server/**`.
- For external inference integration, see `src/lib/CLOUD_RUN_INTEGRATION_GUIDE.md`.

