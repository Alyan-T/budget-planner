# Budget Planner

An AI-assisted budget planner built with Next.js (App Router) and Supabase Cloud.
Type transactions in plain English ("Spent $15 on gas"), see spending by
category, track a monthly budget, and get AI-generated spending insights.

## Stack

- **Next.js 14** (App Router, Server Components)
- **Supabase Cloud** — Postgres database, auth, and Row Level Security
- **Google Gemini** (`gemini-2.0-flash`) — parses natural-language transactions
  and writes short insight summaries; all math (totals, ratios, projections)
  is deterministic JS, not AI-generated
- **Tailwind CSS** for styling, **Recharts** for charts

## 1. Create a Supabase project

1. Go to https://supabase.com and create a new project.
2. In the SQL editor, run everything in [`supabase/schema.sql`](./supabase/schema.sql).
   This creates the `categories`, `transactions`, and `budgets` tables and
   enables Row Level Security so each user can only read/write their own rows.
3. In **Authentication > Providers**, make sure Email is enabled (it is by default).
4. Grab your **Project URL** and **anon public key** from
   **Project Settings > API**.

## 2. Get a Gemini API key

Create a key at https://aistudio.google.com/app/apikey.

## 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_API_KEY=your-gemini-api-key
```

## 4. Install and run

```bash
npm install
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/login`. Sign up with
any email/password (Supabase's default email confirmation may apply depending
on your project's auth settings).

## 5. Add some categories

The transaction parser matches free text against your existing categories, so
add a few first. Easiest way for now: insert rows directly in the Supabase
table editor for `categories`, e.g.:

| user_id           | name          | type    |
|-------------------|---------------|---------|
| (your auth uid)   | Salary        | income  |
| (your auth uid)   | Groceries     | expense |
| (your auth uid)   | Gas           | expense |
| (your auth uid)   | Rent          | expense |
| (your auth uid)   | Entertainment | expense |

(There's a commented-out `insert` template for this at the bottom of
`supabase/schema.sql`.)

## 6. Add budgets (optional)

To see the budgets page populated, insert rows into `budgets` for the current
month, e.g. `month = '2026-07-01'`, tied to a `category_id` and a `limit_amount`.

## Project structure

```
budget-planner/
├── middleware.ts              # refreshes Supabase session, protects routes
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   └── insights.ts            # shared AI-insights logic (used by page + API route)
├── app/
│   ├── layout.tsx / globals.css / page.tsx
│   ├── login/page.tsx
│   ├── auth/callback/route.ts
│   ├── dashboard/page.tsx
│   ├── transactions/page.tsx
│   ├── budgets/page.tsx
│   └── api/
│       ├── parse-transaction/route.ts   # NL transaction -> structured row
│       ├── insights/route.ts            # thin wrapper over lib/insights.ts
│       └── forecast/route.ts            # deterministic end-of-month projection
├── components/
│   ├── NavBar.tsx, TransactionInput.tsx, TransactionList.tsx
│   ├── CategoryPieChart.tsx, TrendChart.tsx
│   └── BudgetProgress.tsx, InsightsCard.tsx
└── supabase/schema.sql        # tables + RLS policies
```

## Notes

- Row Level Security means that even if a query has a bug, one user cannot
  read another user's rows — enforced at the database level, not just in
  application code.
- The dashboard originally fetched `/api/insights` over HTTP from a Server
  Component, which is awkward because you'd need to forward auth cookies
  manually. This build instead extracts that logic into `lib/insights.ts` and
  imports it directly in `app/dashboard/page.tsx`; `app/api/insights/route.ts`
  is kept as a thin public wrapper around the same function for any client-side
  or external use.
