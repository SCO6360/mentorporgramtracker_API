# CLAUDE.md

Mentor Program Tracker API: Express 5 + strict TypeScript, backed by Postgres.

## Project context

This is a portfolio project that may be reviewed in a job interview. Every change should hold up to a reviewer reading the code and commit history. Priorities, in order:

1. **Secure**: validate all request input at the boundary, use parameterized queries only (via the ORM), never log or return secrets or stack traces, keep dependencies current, and treat CodeQL alerts as blockers.
2. **Simple**: the smallest design that does the job well. No speculative abstractions, layers, or dependencies; each one must earn its place.
3. **Professional**: consistent structure and naming, clear error responses, meaningful tests, focused commits and PRs with useful descriptions.
4. **Impressive**: stand out through polish and judgment, not complexity. For example: thorough tests, a clean README with setup steps, good API error design, and well-explained decisions in PRs.

When these conflict, prefer secure and simple over impressive.

## Data-flow checks

Before opening a PR that touches an endpoint or data model, trace each request from input to response and confirm:

- **In**: every field from the body, params, query, or headers is validated (type, length, format) before use; unknown fields are rejected or stripped.
- **Who**: the caller is allowed to read or change this specific record, not just this kind of record.
- **Store**: only intended fields are written (no passing raw request bodies to the ORM); multi-step writes use a transaction.
- **Out**: responses return only what the caller needs; no password hashes, internal IDs that leak other users' data, or other secrets.
- **Errors**: failures return a consistent JSON shape with the right status code (400/401/403/404/409/500) and no stack traces or SQL details.
- **Sense check**: the flow matches the domain (e.g. a mentee cannot approve their own session, deleted records cannot be updated) and the endpoint name and method match what it does.

Summarize these checks in the PR description.

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
