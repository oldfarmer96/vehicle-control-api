# AGENTS.md

## Project Overview

NestJS + TypeScript API with Prisma ORM (PostgreSQL). Vehicle access control system.

## Dev Commands

```bash
npm run build       # compile (uses tsconfig.build.json)
npm run start:dev  # watch mode
npm run lint       # eslint --fix
npm run format     # prettier --write
npm run test       # unit tests (src/**/*.spec.ts)
npm run test:e2e   # e2e tests (test/jest-e2e.json)
```

## Build & Typecheck

- `nest build` uses `tsconfig.build.json` (not the root `tsconfig.json`)
- Path alias: `@src/*` maps to `./src/*`
- Module format: `nodenext` (ESM) in tsconfig, but Prisma uses `moduleFormat = "cjs"` output to `src/generated/prisma`

## Prisma

- Schema: `prisma/schema.prisma`
- Client generated to `src/generated/prisma` (committed, do not regenerate unless schema changes)
- Run migrations: `npx prisma migrate dev`
- Seed: `npx prisma db seed` (seed script at `prisma/seed.ts`)

## Required Env Vars

`DATABASE_URL`, `PORT`, `NODE_ENV`, `CORS_ORIGINS`, `API_PREFIX`, `JWT_SECRET`, `COOKIE_NAME`, `COOKIE_SECRET`, `CAMERA_WEBHOOK_KEY`, `TOKEN_JSON_API`, `URL_PLACA_API`. All validated by Joi on startup via `src/config/env.config.ts`. Missing vars will crash the app.

## API Conventions

- Default prefix: `api` (configurable via `API_PREFIX` env var)
- `exclude: ['health']` - health check bypasses prefix
- Global ValidationPipe with `whitelist`, `forbidNonWhitelisted`, `transform`
- Port default: `4000`, binds to `0.0.0.0`

## Auth

- JWT + cookie-based authentication
- Passport strategies in `src/modules/auth/strategies/`

## Modules

`auth`, `users`, `vehicles`, `persons`, `registrations`, `access-events` (WebSocket gateway)
