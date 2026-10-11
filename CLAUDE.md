# CLAUDE.md

Mentor Program Tracker API: Express 5 + strict TypeScript, backed by Postgres.

## Commands

- `npm run dev`: run the server with reload (tsx), default port 4100
- `npm run typecheck`, `npm run lint`, `npm test`: the same three checks CI runs; all must pass before a PR
- `npm run build` / `npm start`: compile to `dist/` and run it
- `docker compose up -d`: local Postgres 18 on `127.0.0.1:5440` (db `mentormatch`, user/pass `mentor`)

Copy `.env.example` to `.env` for local config. Never commit `.env`.

## Layout

- `src/app.ts`: builds and exports the Express `app` (no `listen`), so tests can import it
- `src/server.ts`: entry point; only starts the server
- Tests sit next to the code as `*.test.ts` and use Vitest + Supertest against `app`

## Conventions

- TypeScript `strict` stays on; avoid `any` and non-null assertions
- Double quotes, semicolons, 2-space indent (Prettier defaults)
- Prefix unused parameters with `_` (e.g. `_req`)
- Every new endpoint gets a Supertest test covering the success path and its main error cases
- Keep `.env.example` in sync when adding environment variables

## Workflow

- One branch per issue, named `<issue#>-short-description`
- Open a PR into `main`; merge with a merge commit after CI passes
- Commit messages: imperative, sentence-case summary (e.g. "Add CI workflow for typecheck, lint, and tests")
- Reference the issue in the PR (`Closes #N`)
