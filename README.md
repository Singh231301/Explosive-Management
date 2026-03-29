# Explosive Management Monorepo

This project is split into two isolated apps.

## Structure

- `frontend/`
  - Standalone Next.js mobile-first UI
  - Stores auth token locally for now
  - Talks to backend only through HTTP API
- `backend/`
  - Express + Prisma API
  - Route -> controller -> service structure
  - Neon/PostgreSQL ready
  - Vercel serverless entry included in `api/index.ts`

## Local setup

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

Backend runs on `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

## Default seeded users

- `admin@magazine.local` / `admin123`
- `operator@magazine.local` / `operator123`
- `auditor@magazine.local` / `auditor123`

## Roles

- `ADMIN`: manage users, products, warehouses, exports, backups
- `OPERATOR`: buy, sell, manage suppliers/customers, update transactions, view reports
- `AUDITOR`: read-only access to reports, inventory, and transactions

## Environment variables

### Backend `.env`

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/explosive_management?schema=public"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/explosive_management?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
BACKUP_SECRET="replace-with-backup-secret"
FRONTEND_URL="http://localhost:3000,https://your-frontend-project.vercel.app"
PORT="4000"
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api"
```

## Vercel + Neon deployment

### Backend on Vercel

1. Create a separate Vercel project with `backend/` as the root directory.
2. Add Neon `DATABASE_URL` and `DIRECT_URL`.
3. Add `JWT_SECRET`, `BACKUP_SECRET`, and `FRONTEND_URL`.
4. Deploy once.
5. Run `npx prisma migrate deploy` against production.
6. Run `npm run prisma:seed` once if you want the default admin/operator/auditor users.

### Frontend on Vercel

1. Create a separate Vercel project with `frontend/` as the root directory.
2. Set `NEXT_PUBLIC_API_BASE_URL` to your backend Vercel URL plus `/api`.
3. Redeploy after backend URL is final.

## Production checklist

- Set strong `JWT_SECRET` and `BACKUP_SECRET`
- Use Neon production connection strings
- Run `prisma migrate deploy`
- Seed only once, then change default passwords from admin settings
- Keep one admin account private
- Use Vercel project env vars, not committed `.env` files
- Keep `/health` available for quick checks
- Review Vercel function logs for audit events and failures

## Current auth note

The app still uses token storage in localStorage to keep your current flow simple. It is structured so you can move to stronger cookie-based auth later without redesigning the rest of the app.
