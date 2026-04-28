# Vehicle Control API

NestJS + TypeScript API with Prisma ORM (PostgreSQL). Vehicle access control system for managing university campus entry/exit.

## Setup

```bash
npm install
```

Create a `.env` file based on `.env.example` (if present) with all required variables:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | `dev` or `prod` | `dev` |
| `CORS_ORIGINS` | Comma-separated allowed origins | required |
| `API_PREFIX` | URL prefix for all routes | required |
| `JWT_SECRET` | Secret for JWT signing | required |
| `COOKIE_NAME` | Cookie name for session | required |
| `COOKIE_SECRET` | Secret for cookie signing | required |
| `CAMERA_WEBHOOK_KEY` | API key for camera webhooks | required |
| `TOKEN_JSON_API` | External API token | required |
| `URL_PLACA_API` | External license plate API URL | required |

## Database

```bash
npx prisma migrate dev     # run migrations
npx prisma db seed         # seed the database
```

Prisma schema is at `prisma/schema.prisma`. Client generated to `src/generated/prisma` (committed).

## Run

```bash
npm run build              # compile (tsconfig.build.json)
npm run start:dev          # watch mode
npm run start:prod         # production (node dist/main)
```

API docs available at `/docs` in `dev` mode. Health check at `/health` (bypasses prefix).

## Test

```bash
npm run test               # unit tests (src/**/*.spec.ts)
npm run test:e2e          # e2e tests (test/jest-e2e.json)
npm run lint              # eslint --fix
npm run format            # prettier --write
```

## API Routes

All routes are prefixed (default: `api/v1`). Auth: JWT + cookie-based via `@Auth()` decorator.

### Auth
- `POST /auth/login` - Login with username/password
- `POST /auth/logout` - Logout (requires auth)

### Users
- `POST /users` - Create user (ADMINISTRADOR)
- `GET /users` - List users with pagination/filters (ADMINISTRADOR)
- `PATCH /users/:id` - Update user (ADMINISTRADOR)
- `PATCH /users/:id/status` - Enable/disable user (ADMINISTRADOR)
- `GET /users/profile` - Get current user profile (auth required)

### Vehicles
- `POST /vehicles` - Create vehicle (ADMINISTRADOR)
- `GET /vehicles` - List vehicles with filters (ADMINISTRADOR)
- `GET /vehicles/:placa/placa` - Get vehicle by license plate (ADMINISTRADOR)
- `POST /vehicles/:id/assign-owner` - Assign person as owner (ADMINISTRADOR)

### Persons
- `POST /persons` - Create person (ADMINISTRADOR)
- `GET /persons` - List persons with filters (ADMINISTRADOR)
- `PATCH /persons/:id` - Update person data (ADMINISTRADOR)
- `PATCH /persons/:id/access-status` - Grant/revoke access (ADMINISTRADOR)

### Registrations
- `POST /registrations/full` - Register vehicle + person + ownership in one step (ADMINISTRADOR)

### Access Events
- `GET /access-events` - List access events with filters (ADMINISTRADOR, CONSULTOR)
- `GET /access-events/recent` - Get recent events (ADMINISTRADOR, CONSULTOR)
- `POST /access-events` - Receive camera webhook (API key auth via `ApiKeyGuard`)

## WebSocket Gateway

Access events module includes a WebSocket gateway (`AccessEventsGateway`) for real-time event broadcasting.

## Architecture

```
src/
├── config/              # Env validation (Joi)
├── core/prisma/         # Prisma service module
├── common/
│   ├── decorators/      # @Auth, @CurrentUser
│   ├── guards/          # JwtAuthGuard, RolesGuard, ApiKeyGuard
│   ├── interfaces/      # CurrentUser, JwtPayload
│   └── pipes/           # ParseUuid pipe
├── modules/
│   ├── auth/            # Login/logout, JWT strategy
│   ├── users/           # User CRUD
│   ├── vehicles/        # Vehicle CRUD
│   ├── persons/         # Person CRUD
│   ├── registrations/   # Full registration
│   └── access-events/   # Access events + WebSocket
├── app.module.ts
└── main.ts
```

## Data Models

- **UsuarioWeb** - Web users (ADMINISTRADOR, CONSULTOR)
- **Persona** - Campus persons (DOCENTE, ALUMNO, ADMINISTRATIVO, VISITANTE)
- **Vehiculo** - Vehicles identified by license plate (placa)
- **VehiculoPersona** - Vehicle-person ownership relation
- **EventoAcceso** - Entry/exit events with OCR confidence and control point
