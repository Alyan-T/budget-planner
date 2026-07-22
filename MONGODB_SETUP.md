# MongoDB Atlas setup

Mongo is schemaless, so there's no SQL file to run — collections
(`users`, `categories`, `transactions`, `budgets`) are created automatically
on first write. Two things are still worth doing manually:

## 1. Create a free cluster

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free
   (M0) cluster.
2. **Database Access** → add a database user with a password (this is
   different from your Atlas login).
3. **Network Access** → add an IP entry. For local dev, "Add current IP
   address" is fine. For Vercel, add `0.0.0.0/0` (allow from anywhere) since
   Vercel's serverless functions don't have stable outbound IPs on the free
   plan — Atlas auth still requires the correct username/password on top of
   this, so this isn't as open as it sounds, but it is broader than an
   allowlist. If you're on an Atlas paid tier with a fixed IP / VPC peering,
   scope this down instead.
4. **Database → Connect → Drivers** → copy the connection string. It looks
   like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Put this in `.env.local` as `MONGODB_URI`.

## 2. Recommended indexes (optional but worth adding once you have data)

In the Atlas UI (Database → Browse Collections → your DB → collection →
Indexes tab), or via `mongosh`:

```js
db.users.createIndex({ email: 1 }, { unique: true });
db.categories.createIndex({ userId: 1 });
db.transactions.createIndex({ userId: 1, occurredAt: -1 });
db.budgets.createIndex({ userId: 1, month: 1 });
```

These aren't required for the app to function — Mongo will scan without
them — but they matter once you have more than a trivial number of documents.

## Note on per-user data isolation

Unlike Supabase/Postgres, MongoDB has no built-in Row Level Security. Every
query in this app filters explicitly by `userId` in application code (see
`lib/queries.ts`, and the `userId` filter in every `find()`/`insertOne()`
call in `app/` and `app/api/`). There's no database-level backstop the way
RLS provided — a bug that forgets the `userId` filter would leak data across
users, so if you add new queries, always scope them by the current session's
`userId` from `getCurrentUser()`.
