# DocGen

DocGen is a monolithic Next.js 15 application for generating event and activity reports.

It combines:

- App Router pages for the public site, member dashboard, and admin dashboard
- Route handlers under `src/app/api/*` for auth, reports, and admin APIs
- MongoDB via Mongoose for persistence
- Cookie-based session handling for auth
- Tailwind CSS and reusable UI components for the frontend
- React Query for client-side data fetching and mutation state

## Current Project Status

The repo has already been migrated from a split Vite + Express setup into a single Next.js application.

The active application now lives in:

- `src/app`
- `src/components`
- `src/hooks`
- `src/lib`
- `public`

Legacy folders from the old architecture are no longer required for runtime and can be removed if you want a cleaner repo history:

- `client/`
- `server/`
- `shared/`
- `script/`
- `monolithic-nextjs/`
- `vite.config.ts`
- `components.json`
- `tsc_output.txt`

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query
- Mongoose / MongoDB
- Radix UI
- Framer Motion
- Zod

## Features

- Public landing page
- Login and signup
- Member dashboard
- Report creation flow
- Report history
- Admin overview
- Admin members list
- Admin reports list
- Middleware-based route protection
- MongoDB-backed seeded demo data

## Folder Structure

```text
src/
  app/
    api/
      admin/
      auth/
      reports/
    admin/
    dashboard/
    login/
    signup/
    globals.css
    layout.tsx
    page.tsx
  components/
    layout/
    ui/
    providers.tsx
  hooks/
    use-admin.ts
    use-auth.ts
    use-reports.ts
    use-toast.ts
  lib/
    http.ts
    mongodb.ts
    queryClient.ts
    schema.ts
    session.ts
    storage.ts
public/
  favicon.png
middleware.ts
next.config.ts
tailwind.config.ts
tsconfig.json
```

## How It Works

### Frontend

- Public and dashboard screens are implemented as App Router pages in `src/app`
- Shared UI elements live in `src/components`
- Data fetching and mutations are handled through React Query hooks in `src/hooks`

### Backend

- API endpoints are implemented as Next route handlers in `src/app/api`
- Database connection is managed in `src/lib/mongodb.ts`
- Data access and seeding are handled in `src/lib/storage.ts`
- Session cookies are created and read in `src/lib/session.ts`

### Auth Model

Authentication currently uses simple cookie sessions:

- `docgen_session` stores the logged-in user id
- `docgen_role` stores the logged-in role

Middleware in `middleware.ts` protects:

- `/dashboard/*`
- `/admin/*`

Admin pages additionally require `docgen_role=admin`.

## Environment Variables

The app currently requires only one real environment variable:

- `DATABASE_URL`

See `.env.example` for the template.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Then set `DATABASE_URL` to your MongoDB connection string.

### 3. Run the app in development

```bash
npm run dev
```

### 4. Type-check the project

```bash
npm run check
```

### 5. Create a production build

```bash
npm run build
```

### 6. Start production mode

```bash
npm run start
```

## Available Scripts

- `npm run dev` - start Next.js in development mode
- `npm run build` - create a production build
- `npm run start` - start the production server
- `npm run check` - run TypeScript type-checking

## Application Routes

### Public Pages

- `/`
- `/login`
- `/signup`

### Member Pages

- `/dashboard`
- `/dashboard/create`
- `/dashboard/history`
- `/dashboard/settings`

### Admin Pages

- `/admin`
- `/admin/create`
- `/admin/members`
- `/admin/reports`
- `/admin/settings`

## API Routes

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Reports

- `GET /api/reports`
- `POST /api/reports`

### Admin

- `GET /api/admin/members`
- `GET /api/admin/reports`

## Seeded Demo Data

On first use, the app seeds demo records if the database is empty.

Default seeded users:

- `admin@example.com` / `password`
- `member@example.com` / `password`

This behavior is implemented in `src/lib/storage.ts`.

## Important Notes

### 1. Passwords are not hashed

The current auth flow is for demo/prototype use. Passwords are compared directly and should be replaced with proper hashing before production.

### 2. Session cookies are simple

The app stores user id and role in cookies. For production, consider signed or encrypted sessions and stronger auth/session invalidation.

### 3. Some old root component wrappers still exist

There are compatibility re-export files under:

- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/components/DashboardLayout.tsx`

These are not the primary implementations. The main files are under `src/components/layout/`.

### 4. Build artifacts should not be committed

These are already ignored:

- `.next/`
- `tsconfig.tsbuildinfo`

## Suggested Cleanup

If you want to fully finalize the migration, the next cleanup step is to remove the old deleted legacy files from git and keep only the Next.js structure.

Recommended keep set:

- `src/`
- `public/`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `next-env.d.ts`
- `middleware.ts`
- `tailwind.config.ts`
- `tsconfig.json`
- `.env.example`
- `.gitignore`
- `README.md`

## Verification

The current Next.js app has already passed:

- `npm run check`
- `npm run build`

## Future Improvements

- Add hashed passwords with `bcrypt`
- Replace custom cookie auth with a more robust session or auth library
- Add report detail pages and export/download support
- Add tests for auth, middleware, and API handlers
- Remove legacy migration leftovers from git completely
