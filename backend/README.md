# Ascend — AI Career Coach Backend

Production-ready Node.js/Express backend with MongoDB, Redis, JWT, Socket.io, OpenAI, Stripe, BullMQ queues, cron jobs, Swagger docs, and Docker.

## Quick start

```bash
cp .env.example .env       # fill in secrets
npm install
docker compose up -d mongo redis
npm run dev                # API on :4000
npm run worker             # background queue consumer (separate terminal)
```

Swagger UI: http://localhost:4000/api/v1/docs
Health: http://localhost:4000/api/v1/health

## Architecture

```
src/
├── config/        env, mongo, redis, openai, stripe, swagger, logger
├── middleware/    auth, rbac, validate, errorHandler, rateLimit
├── modules/
│   ├── auth/         register, login, refresh, logout, forgot/reset
│   ├── users/        profile CRUD, avatar
│   ├── onboarding/   multi-step goals + persona
│   ├── chat/         AI Coach — streaming SSE, conversation history
│   ├── resume/       upload (multer), pdf-parse, AI scoring
│   ├── roadmap/      AI-generated 12-week plan, progress tracking
│   ├── jobs/         recommendations + match scoring
│   ├── interview/    question bank + AI feedback on answers
│   ├── notifications/ in-app + websocket push
│   ├── billing/      Stripe checkout + webhook + subscriptions
│   ├── admin/        users mgmt, role assignment
│   └── analytics/    aggregated stats, dashboards
├── queues/        BullMQ producers + worker (resume parsing, emails, embeddings)
├── jobs/          node-cron tasks (digest, cleanup, trial expiry)
├── ws/            Socket.io gateway + auth handshake
├── utils/         async handler, AppError, jwt, pagination
└── server.js      Express bootstrap, graceful shutdown
```

## Modules & key endpoints

### Auth
- `POST /auth/register` — email + password (bcrypt 12 rounds)
- `POST /auth/login` — returns access + httpOnly refresh cookie
- `POST /auth/refresh` — rotates refresh token (Redis denylist on logout)
- `POST /auth/logout`
- `POST /auth/forgot-password` / `POST /auth/reset-password`
- `GET /auth/me`

### Users / Profile / Onboarding
- `GET/PATCH /users/me`
- `POST /users/me/avatar` (multer)
- `POST /onboarding` — saves goal, role, experience, skills

### AI Chat Coach
- `POST /chat/conversations` — start
- `GET /chat/conversations` / `GET /chat/conversations/:id`
- `POST /chat/conversations/:id/messages` — SSE streaming token-by-token via OpenAI

### Resume Analyzer
- `POST /resume/upload` (multipart, PDF) → queued for parsing + AI scoring
- `GET /resume/:id` — score, strengths, gaps, suggestions

### Roadmap
- `POST /roadmap/generate` — AI builds personalised 12-week plan
- `GET /roadmap` — current plan + progress
- `PATCH /roadmap/items/:id` — toggle complete

### Jobs
- `GET /jobs` — paginated, filtered (location, remote, level)
- `GET /jobs/recommended` — AI-scored matches against profile

### Interview Prep
- `GET /interview/questions?type=behavioral`
- `POST /interview/answers` — AI grades content/structure/delivery, returns score + feedback

### Notifications
- `GET /notifications` / `PATCH /notifications/:id/read`
- WebSocket channel `user:{id}` pushes new notifications live

### Billing (Stripe)
- `POST /billing/checkout` — creates Checkout Session
- `POST /billing/portal` — Customer Portal link
- `POST /billing/webhook` — handles `customer.subscription.*`, `invoice.paid`

### Admin (role: `admin`)
- `GET /admin/users` / `PATCH /admin/users/:id/role`
- `GET /admin/stats`

### Analytics
- `GET /analytics/dashboard` — DAU/WAU, conversions, AI usage

## Security
- helmet, hpp, mongo-sanitize, CORS allow-list
- JWT access (15m) + refresh (30d, httpOnly, rotated, Redis denylist)
- bcrypt 12 rounds; password policy via Joi
- express-rate-limit + rate-limit-redis (per-IP and per-user)
- RBAC middleware (`user`, `pro`, `admin`)
- Joi validation on every body/query/param

## Deploy
- **Render / Railway / Fly**: provision MongoDB Atlas + Upstash Redis, set env vars, deploy `Dockerfile`. Run worker as a separate service with `node src/queues/worker.js`.
- **AWS**: ECS Fargate (api + worker tasks), DocumentDB, ElastiCache, ALB, S3 for uploads (swap multer disk → multer-s3).
- **Frontend wiring**: set `VITE_API_URL=https://api.yourdomain.com/api/v1` and point auth/chat/resume calls there.
