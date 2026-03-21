# Explosive Management Monorepo

This project is now split into two isolated apps.

## Structure

- `frontend/`
  - Standalone Next.js mobile-first UI
  - Stores auth token locally
  - Talks to backend only through HTTP API
- `backend/`
  - Standalone Express + Prisma API
  - Route -> controller -> service structure
  - PostgreSQL/Neon ready

## Important local database name

Create this database in pgAdmin:

`explosive_management`

## Manual install commands

### Backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Backend runs on:

`http://localhost:4000`

### Frontend

Open a new terminal:

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend runs on:

`http://localhost:3000`

## Environment notes

### Backend `.env`

Use PostgreSQL local first:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/explosive_management?schema=public"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/explosive_management?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
BACKUP_SECRET="replace-with-backup-secret"
FRONTEND_URL="http://localhost:3000"
PORT="4000"
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api"
```

## Deploy later

- Frontend can go to Vercel or any Node host that supports Next.js.
- Backend can go to Render, Railway, VPS, Docker, or Vercel if you want.
- For production with Neon, replace backend `DATABASE_URL` and `DIRECT_URL` with Neon strings.

## Seed login

- Email: `admin@magazine.local`
- Password: `admin123`
