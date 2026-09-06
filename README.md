# Nav — Next.js Full Stack

Single Next.js app with API routes + React UI. Same MongoDB Atlas database as before.

## Setup

```bash
cd next-app
npm install
npm run seed   # optional if DB already seeded
npm run dev
```

Open **http://localhost:3000**

## Login

| User | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@nav.com | SuperAdmin@123 |
| Admin | admin@nav.com | Admin@123 |
| User | user@nav.com | User@123 |

## Structure

```
next-app/
├── app/
│   ├── api/          # Backend API routes
│   ├── (main)/       # Dashboard pages (protected)
│   └── login/        # Login page
├── lib/              # DB, models, auth, navigation
├── components/       # UI components
└── context/          # Auth & App state
```

## Env

Uses `.env.local` with same `MONGODB_URI` as the Express backend.
