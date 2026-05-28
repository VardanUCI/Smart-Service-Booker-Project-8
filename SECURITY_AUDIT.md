# Security Audit

**Date:** 2026-05-27
**Auditor:** Kenny Nguyen / Claude Code

## Scope

- Dependency vulnerability scan (`pnpm audit`)
- Environment variable exposure
- Supabase RLS policy review
- API route authentication coverage
- Input validation (Zod schemas)
- Error message leakage in 500 responses
- Duplicate route cleanup

## Issues Found and Fixed

| # | Issue | File(s) | Fix Applied |
|---|-------|---------|-------------|
| 1 | `lat`/`lon` query params passed to PostGIS RPC without NaN check — invalid strings produced `NaN` args | `app/api/search/route.ts` | Added `parseFloat` + `isNaN` guards; returns 400 `'lat and lon must be valid numbers'`; `radius` falls back to 5000 on invalid input |
| 2 | Duplicate `app/api/waitlists/` directory — hard-deleted rows (no audit trail), no UUID param validation, leaked `error.message` on 500s | `app/api/waitlists/route.ts`, `app/api/waitlists/[id]/route.ts` | Deleted entire directory; canonical routes at `app/api/waitlist/` retained (soft delete, UUID validation, ownership checks) |
| 3 | `contact_value` not validated for phone/email format in duplicate waitlists POST | Removed with Issue 2 | Resolved by deletion |
| 4 | Supabase `error.message` returned directly to clients in 500 responses — exposes internal DB/RPC details | `auth/logout`, `auth/signup`, `auth/login`, `notifications`, `search`, `availability`, `providers/dashboard`, `providers/requests` | Replaced with `'Internal server error'`; original message kept in `console.error` only |
| 5 | `database.types.ts` missing `Relationships: []` on all tables and `Views` entry — caused `GenericSchema` conformance failure in `@supabase/supabase-js` v2.105.0, making all table types resolve to `never` | `types/database.types.ts` | Added `Relationships: []` to every table; added `Views: Record<string, never>` to schema |

## Accepted Risks

| Dependency | Introduced Via | Vulnerability | Decision |
|------------|---------------|---------------|----------|
| `lodash` | `recharts` (charting library) | Prototype pollution in older versions | Accepted — transitive dep, not directly called; no user-controlled input flows through it |
| `postcss` | `next` build pipeline | RegEx DoS in older versions | Accepted — build-time only, not in request path |
| `ws` | `@supabase/realtime-js` | DoS via headers in older versions | Accepted — server-side WebSocket client inside Supabase SDK; not exposed to untrusted input |

## Remaining Non-Critical Notes

- `PATCH /providers` and `PATCH /availability/[id]` spread `result.data` directly into `.update()` — acceptable for current narrow schemas, but should switch to explicit column allowlists if schemas are widened.
- `POST /providers/open-slot` has no deduplication guard against concurrent double-triggers — acceptable for MVP; should move to a DB transaction/RPC before production.
- `app/api/provider/` (singular, old) and `app/api/providers/` (plural, new) both contain `requests` and `dashboard` routes — old versions use raw `getUser` instead of `getBusinessAccount`. Resolve before launch.
- No rate limiting on auth endpoints (`/signup`, `/login`, `/resend-verification`) — Supabase Auth applies its own limits, but consider adding edge-level rate limiting (e.g. Vercel middleware) before production.
