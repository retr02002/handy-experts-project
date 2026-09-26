# OPTIMIZATION.md — Performance Rules (Next.js + Prisma on Vercel)

> Every agent (Claude Code, Antigravity, Cursor, etc.) MUST follow this file for every change.
> Goal: **buttery-fast app. API and DB query time 10–100 ms. Never more.**

---

## 0. Performance Budgets (hard limits)

| Metric                                | Target   | Hard limit |
| ------------------------------------- | -------- | ---------- |
| DB query (single, warm)               | 5–30 ms  | 50 ms      |
| API route / Server Action (warm, p95) | 10–60 ms | 100 ms     |
| Response payload (JSON)               | < 20 KB  | 50 KB      |
| TTFB (page)                           | < 200 ms | 400 ms     |
| LCP                                   | < 1.5 s  | 2.5 s      |
| INP                                   | < 100 ms | 200 ms     |
| CLS                                   | < 0.05   | 0.1        |
| First-load JS per route (gzipped)     | < 120 KB | 180 KB     |
| DB round-trips per request            | 1–2      | 3          |

If a change breaks a budget, **fix it before finishing the task**. If it cannot be fixed, stop and explain why.

Note: the 10–100 ms target applies to **warm** requests with the function and DB in the **same region**. Cold starts are minimized by Fluid compute + connection pooling (Section 1), not by code alone.

---

## 1. Infrastructure (do once, keep forever)

### 1.1 Same region for functions and DB

The Vercel function region MUST match the database region. Example (DB in Mumbai):

```json
// vercel.json
{
  "regions": ["bom1"]
}
```

Per-route override (only if needed):

```ts
export const preferredRegion = "bom1";
```

Never leave functions on the default region if the DB is elsewhere. Cross-region = +100–250 ms per query.

### 1.2 Fluid compute

Enable **Fluid compute** in Vercel project settings (reduces cold starts, reuses instances, lowers CPU cost).

### 1.3 Connection pooling (mandatory on serverless)

- `DATABASE_URL` → **pooled** connection (PgBouncer / Neon pooled / Supabase pooler / Prisma Accelerate).
- `DIRECT_URL` → direct connection, used only for migrations.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

For PgBouncer, add `?pgbouncer=true&connection_limit=1` (adjust to provider docs).

### 1.4 Prisma client singleton + slow-query logging

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  }).$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const ms = performance.now() - start;
        if (ms > 50)
          console.warn(`[SLOW QUERY] ${model}.${operation} ${ms.toFixed(1)}ms`);
        return result;
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Never call `new PrismaClient()` anywhere else.

---

## 2. Prisma Query Rules

### 2.1 Always `select` only what the UI needs

```ts
// ❌ BAD — fetches every column + full relations
prisma.lead.findMany({ include: { activities: true, notes: true } });

// ✅ GOOD
prisma.lead.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    ownerName: true,
    updatedAt: true,
  },
});
```

No `include` without a nested `select`. No unbounded relation loads.

### 2.2 Always paginate — cursor-based, max 50 rows

```ts
const PAGE_SIZE = 25;

export async function getLeads({
  cursor,
  status,
}: {
  cursor?: string;
  status?: string;
}) {
  const rows = await prisma.lead.findMany({
    where: { ...(status && { status }) },
    select: { id: true, name: true, status: true, updatedAt: true },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, -1) : rows;
  return { items, nextCursor: hasMore ? items.at(-1)!.id : null };
}
```

- Never `findMany` without `take`.
- Avoid large `skip` (offset) pagination — slow on big tables.
- Order by an indexed column + a unique tiebreaker (`id`).

### 2.3 Index every column used in `where`, `orderBy`, and joins

```prisma
model Lead {
  id        String   @id @default(cuid())
  status    String
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId, status, updatedAt(sort: Desc)])
  @@index([status, updatedAt(sort: Desc)])
}
```

- Composite index column order = equality filters first, then sort column.
- Every foreign key gets an index.
- For text search (`contains`, `mode: "insensitive"`) on large tables, use a Postgres `pg_trgm` GIN index or full-text search via a raw migration — plain `ILIKE '%x%'` does a full scan.
- Verify with `EXPLAIN ANALYZE` — must show `Index Scan`, not `Seq Scan`, on large tables.

### 2.4 No N+1 queries

```ts
// ❌ BAD — one query per lead
for (const lead of leads) {
  lead.owner = await prisma.user.findUnique({ where: { id: lead.ownerId } });
}

// ✅ GOOD — one batched query
const owners = await prisma.user.findMany({
  where: { id: { in: leads.map((l) => l.ownerId) } },
  select: { id: true, name: true },
});
```

Or a nested `select` on the relation. If the Prisma version supports it, use `relationLoadStrategy: "join"` for single-round-trip relation loading.

### 2.5 Run independent queries in parallel

```ts
// ❌ sequential: 3 × 20ms = 60ms
const lead = await getLead(id);
const stats = await getStats(id);
const owner = await getOwner(id);

// ✅ parallel: ~20ms
const [lead, stats, owner] = await Promise.all([
  getLead(id),
  getStats(id),
  getOwner(id),
]);
```

### 2.6 Counts and aggregates

- Never run `count()` on every list request for big tables. Cache it (Section 4) or show "load more" instead of total pages.
- Use `groupBy` / `_count` / `aggregate` in the DB — never fetch rows to count them in JS.
- Heavy dashboards/stats → precompute (cached, or a summary table updated on write).

### 2.7 Writes

- Batch with `createMany` / `updateMany`.
- Use `$transaction([...])` only when atomicity is needed; keep transactions short.
- Never `select` the full row back after an update unless the UI needs it.

---

## 3. API Segmentation

One endpoint (or Server Action / data function) per **UI need**, not one giant endpoint.

```
/api/leads                  → list page: id, name, status, owner, updatedAt (paginated)
/api/leads/[id]             → detail header only: core fields
/api/leads/[id]/activities  → Activities tab (paginated, loaded when tab opens)
/api/leads/[id]/notes       → Notes tab (paginated, loaded when tab opens)
/api/leads/[id]/files       → Files tab (loaded when tab opens)
/api/leads/filters          → filter options (cached, long TTL)
```

Rules:

- Load only the **active tab's** data. Other tabs load on click (and may prefetch on hover).
- Response shape = exactly what the component renders. No extra fields.
- Put data access in `lib/data/*.ts` (server-only), reused by Server Components, Route Handlers, and Server Actions. Add `import "server-only"`.
- Prefer Server Components calling data functions directly over the component fetching its own API route (removes an extra HTTP hop).
- Validate inputs (zod) cheaply; reject bad params before touching the DB.
- **proxy must not query the DB.** Auth checks use a signed JWT/session cookie, not a DB lookup per request.
- Set `Server-Timing` headers on API routes for visibility:

```ts
return NextResponse.json(data, {
  headers: {
    "Server-Timing": `db;dur=${dbMs.toFixed(1)}, total;dur=${totalMs.toFixed(1)}`,
  },
});
```

---

## 4. Caching (read-heavy data)

Use the caching API that matches the installed Next.js version (check `package.json`):

- Next.js 15+/16 with `use cache` enabled → `"use cache"` + `cacheTag()` + `cacheLife()`.
- Otherwise → `unstable_cache(fn, keys, { tags, revalidate })`.
- Always wrap per-request data functions in React `cache()` to dedupe within one render.

```ts
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";

export const getFilterOptions = unstable_cache(
  async () => prisma.leadStatus.findMany({ select: { id: true, label: true } }),
  ["lead-filter-options"],
  { tags: ["lead-filters"], revalidate: 3600 },
);

export const getLeadHeader = cache(async (id: string) =>
  prisma.lead.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  }),
);

// after a mutation:
revalidateTag("lead-filters");
```

Rules:

- Cache: filter options, dropdowns, counts, dashboard stats, user/org settings.
- Don't cache per-user sensitive data under a shared key — include userId/orgId in the key.
- Every mutation MUST invalidate the tags it affects. Stale data is a bug.
- GET route handlers returning shareable data: `Cache-Control: s-maxage=60, stale-while-revalidate=300`.

---

## 5. Rendering & Lazy Loading

### 5.1 Server Components first

- Default to Server Components. Add `"use client"` only for interactivity, at the smallest leaf possible.
- Never pass large objects from server to client — pass only needed props.

### 5.2 Streaming with Suspense

```tsx
// app/leads/[id]/page.tsx
export default async function LeadPage({ params }) {
  const { id } = await params;
  const header = await getLeadHeader(id); // fast, critical
  return (
    <>
      <LeadHeader data={header} />
      <Suspense fallback={<TabSkeleton />}>
        <ActiveTab leadId={id} /> {/* streams in */}
      </Suspense>
    </>
  );
}
```

- Every route has `loading.tsx` with a skeleton matching the final layout (no CLS).
- Slow sections get their own `<Suspense>` so they never block the page.

### 5.3 Lazy-load heavy client components

```tsx
import dynamic from "next/dynamic";

const LeadChart = dynamic(() => import("@/components/lead-chart"), {
  loading: () => <ChartSkeleton />,
});
const RichEditor = dynamic(() => import("@/components/rich-editor"), {
  ssr: false,
});
const ImportModal = dynamic(() => import("@/components/import-modal"));
```

Lazy-load: charts, rich-text editors, date pickers, modals/drawers, maps, PDF/CSV tools, anything below the fold.

### 5.4 Assets

- Images: `next/image` with `width`/`height` or `fill` + `sizes`. `priority` only on the LCP image.
- Fonts: `next/font` only. No external font `<link>`.
- Third-party scripts: `next/script` with `strategy="lazyOnload"` or `afterInteractive`.

---

## 6. Client-side Data & UI Speed

- Use TanStack Query (or SWR) for client fetching with sensible `staleTime` (e.g. 30–60 s) — no refetch storms.
- Keep filters, tabs, search, and page cursor in **URL search params** (shareable, back-button safe).
- Debounce search inputs (250–300 ms). Cancel stale requests (`AbortController` / query keys).
- Optimistic updates for status changes, notes, and quick edits.
- Lists > 100 rows → virtualize (`@tanstack/react-virtual`).
- Prefetch on hover: `<Link prefetch>` for the lead detail page; `queryClient.prefetchQuery` for tabs.
- Memoize only when profiling shows re-render cost (`React.memo`, `useMemo`). No blanket memoization.
- Avoid request waterfalls: parent and child should not fetch sequentially when data is independent.

---

## 7. Bundle Size

- Run `@next/bundle-analyzer` after dependency changes.
- `next.config` → `experimental.optimizePackageImports` for icon/UI libraries (e.g. `lucide-react`, `date-fns`).
- Banned: `moment` (use `date-fns`/`dayjs`), full `lodash` import (use `lodash-es/xyz` or native), importing whole icon sets.
- Server-only libs (prisma, bcrypt, sdk clients) must never reach client bundles — guard with `import "server-only"`.

---

## 8. Measurement (prove it, don't guess)

Before and after every optimization task, record:

1. `next build` output — first-load JS per route.
2. `[SLOW QUERY]` logs (anything > 50 ms).
3. `Server-Timing` values for the touched API routes.
4. Vercel Speed Insights / Lighthouse for LCP, INP, CLS.
5. `EXPLAIN ANALYZE` for any new or changed query on a large table.

Report results as a before/after table in the task summary.

---

## 9. Anti-patterns (never do these)

- `findMany()` with no `where`, `select`, or `take`
- `include: { relation: true }` on lists
- Queries inside loops (N+1)
- Sequential `await`s for independent data
- Offset pagination with large `skip`
- DB calls in `proxy.ts`
- `new PrismaClient()` outside `lib/prisma.ts`
- Fetching all tabs' data on page load
- `"use client"` at the page/layout level
- `useEffect` fetch chains on first render when a Server Component can fetch
- Returning entire DB rows to the client
- `count()` on every paginated request for large tables
- Functions and DB in different regions
- Mutations that don't invalidate caches
- `new PrismaClient()` inside `lib/auth.ts` (use the singleton)
- Calling `auth.api.getSession` multiple times per request without React `cache()`
- Treating the proxy cookie check as authorization
- Awaiting emails / analytics / webhooks inside sign-in
- Lowering password-hash cost to speed up login

---

## 10. Authentication (Better Auth + Prisma)

**Budgets:** sign-in API ≤ 400 ms warm (password hashing is intentionally ~50–250 ms), `getSession` ≤ 20 ms (from cookie cache) / ≤ 50 ms (DB), login click → dashboard visible ≤ 1.5 s.

An 8-second login is never the hash alone. It is almost always a stack of: cold start + cross-region DB + no pooling + multiple sequential session lookups + blocking work (emails, hooks) + a heavy dashboard loading right after. **Measure each step before changing anything.**

### 10.1 Diagnose first

1. Wrap the auth route handler with timing and log total duration per endpoint (`/sign-in/email`, `/get-session`).
2. Keep the Prisma slow-query logger on (Section 1.4) — count how many queries one sign-in runs and how long each takes.
3. In the browser Network tab, separate: (a) the sign-in request, (b) redirects, (c) `get-session` calls, (d) dashboard page load. Fix the largest one first.
4. Check: are functions and DB in the same region? Is `DATABASE_URL` pooled? Is Fluid compute on?

### 10.2 Auth config (reference)

Check the installed `better-auth` version and its docs — option names change between versions (e.g. joins moved from `experimental.joins` to `advanced.database.joins`).

```ts
// lib/auth.ts
import "server-only";
import { betterAuth } from "better-auth/minimal"; // smaller bundle with Prisma adapter (if the version supports it)
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma"; // the singleton — NEVER new PrismaClient() here

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET, // required, 32+ random chars, never hard-coded
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL!],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Keep the default hasher (scrypt). If a custom hasher exists, use argon2id or bcrypt cost 10–12.
    // NEVER lower hashing cost below safe values to "speed up" login.
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh expiry at most once a day (avoids a DB write per request)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // session read from signed cookie; DB hit at most every 5 min
    },
  },

  advanced: {
    database: { joins: true }, // single-query session+user fetch (needs relations in schema)
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 }, // brute-force protection
      "/sign-up/email": { window: 60, max: 3 },
    },
  },

  plugins: [nextCookies()], // must be last; lets Server Actions set auth cookies
});
```

### 10.3 Prisma schema for auth tables

Run `npx auth@latest generate` (or the CLI for the installed version) and diff against the current schema. Required:

- `User.email` `@unique`, `Session.token` `@unique`
- `@@index([userId])` on `Session` and `Account`
- `@@index([identifier])` on `Verification`
- Relations defined (`user User @relation(...)`) so joins work
  Then `npx prisma migrate dev --name auth-indexes`.

### 10.4 Session checks — one per request, cheap

```ts
// lib/session.ts
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Deduped: layout + page + components share ONE lookup per request
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
```

```ts
// proxy.ts — optimistic redirect only, NO DB call
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(req: NextRequest) {
  if (!getSessionCookie(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/leads/:path*"] };
```

**Security:** `getSessionCookie` only checks that a cookie exists — it is NOT authorization. Every protected page, route handler, and Server Action MUST call `requireSession()` (and check role/ownership) before touching data.

### 10.5 Sign-in flow (client)

```tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: String(formData.get("email") ?? "")
          .trim()
          .toLowerCase(),
        password: String(formData.get("password") ?? ""),
      });
      if (error) {
        setError("Invalid email or password"); // generic — never reveal which field was wrong
        return;
      }
      router.replace("/dashboard"); // client navigation, no full reload
      router.refresh();
    });
  }

  return (
    <form action={onSubmit}>
      {/* inputs with autoComplete="email" / "current-password" */}
      <button disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

- Prefetch the dashboard on the login page (`router.prefetch("/dashboard")`).
- Don't call `useSession()` on the login page just to check state — check server-side and redirect.

### 10.6 Remove blocking work from login

- No emails, analytics, audit logs, or third-party calls awaited inside sign-in or `databaseHooks`. Defer them (Better Auth background tasks / `waitUntil` / `after()` from `next/server`).
- `databaseHooks` must be fast (single indexed query max) or deferred.
- The dashboard after login follows Sections 3–5: stream it, load only critical data first.

### 10.7 Auth security rules (non-negotiable)

- Secrets only from env; `BETTER_AUTH_SECRET` is long and random. Never log tokens, passwords, or session objects.
- Cookies: `httpOnly`, `secure` in production, `sameSite=lax` (Better Auth defaults — don't override to weaker).
- Rate-limit sign-in/sign-up/reset endpoints. Use a shared store (DB or Redis `secondaryStorage`) in production — in-memory limits don't work across serverless instances.
- Generic error messages on login and password reset (no user enumeration).
- Validate and normalize input (zod, lowercase + trim email).
- Every Server Action and route handler re-checks the session and permissions — never trust the client or proxy alone.
- `trustedOrigins` set; no wildcard CORS on auth routes.
- Cookie cache `maxAge` stays short (≤ 5 min) — revoked sessions stay valid until it expires. For sensitive actions (password change, role change, delete) call `getSession` with cache disabled per the installed version's docs.

---

## 11. Definition of Done (checklist for every change)

- [ ] All queries use `select` and `take`; no N+1
- [ ] New `where`/`orderBy` columns are indexed (migration added)
- [ ] Independent queries run in `Promise.all`
- [ ] API returns only needed fields; payload < 50 KB
- [ ] Heavy components lazy-loaded; `loading.tsx` / Suspense in place
- [ ] Cache added where data is read-heavy; mutations invalidate tags
- [ ] No DB calls in proxy
- [ ] Auth: one deduped session lookup per request; cookie cache on; protected code calls `requireSession()`
- [ ] Auth: sign-in ≤ 400 ms warm; no blocking work in sign-in or hooks; security rules in 10.7 intact
- [ ] `next build` passes; no new route exceeds JS budget
- [ ] Warm API p95 ≤ 100 ms; query p95 ≤ 50 ms (measured, not assumed)
- [ ] Existing behavior unchanged (same UI, same data, same permissions)
