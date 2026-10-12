# Mentor Program Tracker API

REST API for running mentorship programs: people, cohorts, and mentor–mentee pairings.

Built with Express 5, strict TypeScript, Prisma 7, and PostgreSQL 18.

## Getting started

Requires Node 22+ and Docker.

```sh
npm install                 # also generates the Prisma client
cp .env.example .env
docker compose up -d        # Postgres on localhost:5440
npm run db:deploy           # apply migrations
npm run db:seed             # load 100 sample users, 2 programs, 70 pairings
npm run dev                 # http://localhost:4100/health
```

## Scripts

| Script               | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Start with reload                               |
| `npm test`           | Run tests                                       |
| `npm run typecheck`  | Type-check the project                          |
| `npm run lint`       | Lint                                            |
| `npm run build`      | Compile to `dist/`                              |
| `npm run db:migrate` | Create and apply a migration after schema edits |
| `npm run db:seed`    | Reset data to the deterministic sample set      |

## Sample data

The seed uses [Faker](https://fakerjs.dev) with a fixed seed, so every run produces the same people and pairings. All emails use the reserved `example.com` domain.
