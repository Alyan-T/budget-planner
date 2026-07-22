# Budget Planner

An AI-assisted budget planner built with Next.js (App Router), MongoDB
Atlas, and custom email/password authentication. Type transactions in plain
English ("Spent $15 on gas"), see spending by category, track a monthly
budget, and get AI-generated spending insights.

## Stack

- **Next.js 14** (App Router, Server Components)
- **MongoDB Atlas** — document database (no ORM, raw `mongodb` driver)
- **Custom auth** — email/password with `bcryptjs` password hashing and
  `jose` (edge-compatible) JWTs stored in an httpOnly cookie. No third-party
  auth service.
- **Google Gemini** (`gemini-2.0-flash`) — parses natural-language
  transactions and writes short insight summaries; all math (totals, ratios,
  projections) is deterministic JS, not AI-generated
- **Tailwind CSS** for styling, **Recharts** for charts

## 1. Set up MongoDB Atlas

See [`MONGODB_SETUP.md`](./MONGODB_SETUP.md) for step-by-step cluster
creation, network access, and the connection string.

## 2. Get a Gemini API key

Create a key at https://aistudio.google.com/app/apikey.

## 3. Generate a JWT secret

```bash
openssl rand -base64 32
```
(Any long random string works — this signs session tokens.)

## 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

```
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=budget_planner
JWT_SECRET=your-random-secret-string
GOOGLE_API_KEY=your-gemini-api-key
```

## 5. Install and run

```bash
npm install
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/login`. Sign up with
any email/password; a session cookie is set immediately and five default
categories (Salary, Groceries, Gas, Rent, Entertainment) are created for you
automatically so the transaction parser has something to match against.

## 6. Add budgets (optional)

To see the budgets page populated, insert a document into the `budgets`
collection for the current month, tied to a `categoryId` (from your
`categories` collection) and a `limitAmount`. `month` must be a `Date` set
to the 1st of the month at midnight UTC, matching how the app queries it.

## Deploying to Vercel

1. Push to GitHub, import the repo at https://vercel.com/new.
2. Add `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `GOOGLE_API_KEY` under
   Project Settings → Environment Variables.
3. In MongoDB Atlas → Network Access, make sure Vercel's traffic is allowed
   (see `MONGODB_SETUP.md` for the tradeoffs of `0.0.0.0/0`).
4. Redeploy after adding env vars — Vercel doesn't retroactively apply them
   to an already-built deployment.

## Project structure

```
budget-planner/
├── middleware.ts               # verifies session JWT (edge-compatible), protects routes
├── lib/
│   ├── mongodb.ts              # cached MongoDB client
│   ├── auth.ts                 # password hashing, JWT sign/verify, getCurrentUser()
│   ├── models.ts                # TypeScript types for each collection
│   ├── queries.ts              # shared category-lookup / join helpers
│   └── insights.ts             # shared AI-insights logic (used by page + API route)
├── app/
│   ├── layout.tsx / globals.css / page.tsx
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── transactions/page.tsx
│   ├── budgets/page.tsx
│   └── api/
│       ├── auth/{signup,login,logout}/route.ts
│       ├── parse-transaction/route.ts   # NL transaction -> structured document
│       ├── insights/route.ts            # thin wrapper over lib/insights.ts
│       └── forecast/route.ts            # deterministic end-of-month projection
├── components/
│   ├── NavBar.tsx, TransactionInput.tsx, TransactionList.tsx
│   ├── CategoryPieChart.tsx, TrendChart.tsx
│   └── BudgetProgress.tsx, InsightsCard.tsx
└── MONGODB_SETUP.md             # cluster setup + recommended indexes
```

## Notes

- **No Row Level Security equivalent.** MongoDB has nothing like Postgres
  RLS — every query in this app filters explicitly by `userId` in
  application code. See the "Note on per-user data isolation" section in
  `MONGODB_SETUP.md` before adding new queries.
- **Why `jose` instead of `jsonwebtoken`:** Next.js middleware runs on the
  Edge runtime, which doesn't support Node's `crypto` module that
  `jsonwebtoken` depends on. `jose` works in both the Node runtime (API
  routes) and the Edge runtime (middleware), so it's used everywhere for
  consistency.
- Login and signup return the same generic "Invalid email or password"
  error rather than distinguishing "no such user" from "wrong password" —
  this avoids leaking which emails have accounts.
