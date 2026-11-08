# KadoBot — Technical Architecture

**Status:** v0.2 — architecture ✅ approved by owner (single Next.js app + managed services: Supabase, Vercel, Resend, Anthropic). Vendor access from Iran and individual packages still need verification/approval.
**Legend:** ✅ Confirmed · 💡 Recommendation · 📌 Assumption · ❓ Open · 🔐 Needs approval

## 0. Current Project Status (inspection result)
- The working directory `/mnt/data` is **empty** of application code: no `package.json`, no Next.js, no config files, no git repo, no `src/` or `app/`.
- Only `.agent/session.jsonl` exists (tool metadata, not part of the product).
- Therefore: nothing is implemented; all infrastructure (framework, Tailwind, TypeScript, linting, DB, auth, tests, CI, env handling) is missing and must be created from scratch, after approval.

## 1. Recommended Architecture — "One Next.js app + managed services"

💡 A **modular monolith**: one codebase, one deployable app. No microservices.

Plain-language explanation: the website and its "back office" live in the same project. The app talks to a few ready-made services (database, email, AI) that other companies run for us, so we don't have to run servers.

```
        ┌───────────────────────────────┐
        │  User's phone / browser       │
        │  (Persian, RTL, mobile-first) │
        └──────────────┬────────────────┘
                       │ HTTPS
        ┌──────────────▼────────────────┐
        │   Next.js app (one project)   │
        │  ┌─────────────┐ ┌──────────┐ │
        │  │ Pages / UI  │ │ Server   │ │
        │  │ (React)     │ │ code &   │ │
        │  │             │ │ API      │ │
        │  └─────────────┘ └────┬─────┘ │
        └───────────────────────┼───────┘
      ┌─────────────┬───────────┼───────────────┬──────────────┐
      ▼             ▼           ▼               ▼              ▼
 ┌─────────┐  ┌──────────┐ ┌──────────┐  ┌────────────┐ ┌─────────────┐
 │Database │  │ Auth     │ │ AI       │  │ Email      │ │ Product data│
 │Postgres │  │          │ │ provider │  │ service    │ │ source (❓) │
 └─────────┘  └──────────┘ └──────────┘  └────────────┘ └─────────────┘
                                ▲
                 ┌──────────────┴─────────────┐
                 │ Scheduler (daily cron job) │ → finds due reminders → sends
                 └────────────────────────────┘
```

## 2. Technology Stack and Justification

| Layer | Choice | Status | Why (simple terms) |
|---|---|---|---|
| Framework | Next.js (App Router) | ✅ | One tool for pages and server code |
| Language | TypeScript | ✅ | Catches mistakes before users see them |
| Styling | Tailwind CSS | ✅ | Fast, consistent; supports RTL via logical utilities (`ms-`, `ps-`, `start-`) |
| Database | PostgreSQL via Supabase | ✅ approved stack choice (owner); ❓ Iran access still to verify | Reliable, relational data fits users→people→occasions. Free tiers exist |
| Auth | Supabase Auth, email login | ✅ approved (email only in MVP) |
| DB access | Supabase client or Prisma/Drizzle | 🔐 | One is needed; 💡 simplest path = Supabase (DB+auth together) |
| Validation | Zod | 🔐 | Checks all user input is correct |
| AI | Provider-agnostic wrapper over an LLM API | 🔐 | Swap providers later |
| Email | Resend (or similar) | 🔐 | Simple email API |
| Scheduler | Vercel Cron / Supabase pg_cron / GitHub Actions cron | 🔐 | Runs "check reminders" daily |
| Hosting | Vercel (or alternative) | 🔐 | Zero-ops deploy for Next.js; ❓ **must be verified as reachable/usable from Iran** (target market ✅ Iran) |
| Fonts | Vazirmatn (self-hosted via `next/font`) | 🔐 | Popular open-source Persian font |
| Date handling | Jalali support library | 🔐 | Persian calendar; pick a small library later |
| Testing | Vitest + Playwright (later) | 🔐 | Unit and end-to-end tests |

All items marked 🔐 are proposals; **nothing is installed** until approved one by one.

## 3. Frontend and Backend Responsibilities
**Frontend (React components in the browser):** layout, forms, Persian/RTL display, Jalali date pickers, client-side form hints, loading/error states.
**Backend (server code inside the same Next.js project):** authentication checks, data validation (again, never trust the browser), database reads/writes, AI calls, product lookups, sending notifications, scheduled jobs. Secrets only exist here.

## 4. API Architecture
- 💡 Use **Server Actions** for simple form-style operations (create recipient, add occasion) and **Route Handlers** (`app/api/...`) for things called by outside systems (cron endpoint, webhooks) or when streaming AI.
- Every endpoint: check logged-in user → validate input (Zod) → check ownership → act → return a consistent `{ ok, data | error }` shape.
- Business logic lives in `src/server/services/*`, not in pages or components.
- Cron endpoints protected by a secret header.
- Rate limiting on AI and auth endpoints.

## 5. Authentication Approach
- ✅ MVP: **email login only** (owner decision), via Supabase Auth. Phone OTP/SMS not in MVP. ✅ Method: **magic link** (owner decision), no passwords. 📌 Link expiry/rate limits to be set. Depends on email reaching Iranian inboxes (untested).
- Sessions via secure HTTP-only cookies.
- Row-level access: each row has `user_id`; users only see their own (enforced in DB policies if Supabase, and in server code).
- Never roll own password hashing.

## 6. AI Integration Architecture
```
Recommendation request
   → validate → load recipient + occasion + budget
   → build prompt (src/server/ai/prompts)
   → AIProvider interface  → [Provider A | Provider B]
   → parse JSON output (Zod) → ideas [{title, reason, category, price range, search keywords}]
   → product matching step → store results in history → return to UI
```
- 💡 `AIProvider` interface with one method (e.g. `generateGiftIdeas`) so providers are swappable.
- Ask the model for **structured JSON**, validate it, retry once on failure.
- AI **must not invent products, prices, or links**. It proposes *ideas*; real products come only from the product source.
- Minimize personal data sent: first name/nickname, relationship, interests, age range — **no** contact details.
- Cost controls: daily per-user limit, cache results for identical inputs, small/cheap model by default, cap tokens, log usage.
- Persian output quality must be tested per model (see risks).

## 7. External Service Integrations
Summarized here, detailed in `API_INTEGRATIONS.md`: AI LLM, product data (uncertain), email, SMS (Phase 2, not in MVP ✅), push (Phase 2), scheduler.

## 8. Security Considerations
- Secrets only in environment variables; `.env*` git-ignored; `.env.example` with names only.
- HTTPS only; secure cookies; CSRF protections (Next.js Server Actions provide origin checks).
- Validate all input on server; parameterized queries (ORM/client does this).
- Authorization check on every read/write (user owns the record).
- Don't log personal data or full prompts in production.
- Protect against prompt injection: treat user notes as data, validate output, never execute AI output.
- Outbound links: `rel="noopener noreferrer sponsored"`; only allow http/https URLs from trusted sources.
- Rate limits, bot protection on signup.
- Account/data deletion path; backup policy.
- Dependency updates and `npm audit` periodically.

## 9. Deployment Recommendations
- 💡 Git repo → GitHub → Vercel (auto-deploy on push) with Preview deployments per branch.
- Two environments: **preview/staging** and **production**, separate databases.
- Managed Postgres in a region close to users.
- Cron: daily trigger hitting a protected endpoint.
- Error monitoring (Sentry free tier) and uptime check — 🔐 later.
- ❓ If hosting must be inside/accessible from Iran, alternatives (self-hosted Node on VPS with Docker) change the plan; decide before choosing.
- Estimated MVP monthly cost: near $0–25 on free tiers + AI usage (📌 estimate, to be verified).

## 10. Technical Risks Assessment

Likelihood/Impact: Low / Medium / High.

### R1. Persian language and RTL support
- **Problem:** mixed RTL/LTR text (prices, Latin brand names, URLs) rendering wrongly; Persian digits; Jalali dates; font quality; icons/arrows not flipped; third-party components built LTR-only.
- **Impact:** High (core requirement). **Likelihood:** High if not handled early.
- **Mitigation:** `dir="rtl"` and `lang="fa"` at root from day one; Tailwind logical properties only; `dir="auto"`/`<bdi>` for user-entered names; test with real Persian content; choose RTL-friendly UI primitives; a Jalali date utility; i18n-ready text files rather than hard-coded strings.
- **Affects MVP:** Yes.

### R2. Product discovery and store integrations
- **Problem:** many stores have no public API; scraping may violate terms, break often, or be legal-risky; affiliate programs may not exist in the target market; prices/stock change quickly; images may be hotlink-restricted.
- **Impact:** High (a confirmed core promise). **Likelihood:** High.
- **Mitigation:** research first (❓ business step); start with one legitimate source (partner feed/API, affiliate feed, manually curated catalog) or fallback to search links; store a `last_checked_at` and show "price may change"; abstract behind a `ProductSource` interface; don't scrape without approval and legal review.
- **Affects MVP:** Yes — biggest uncertainty.

### R3. AI API costs and usage optimization
- **Problem:** costs grow with users; long prompts; abuse; poor Persian output from some models.
- **Impact:** Medium. **Likelihood:** Medium.
- **Mitigation:** per-user daily quotas, caching, cheaper model, short prompts, structured outputs, usage logging, budget alerts at provider.
- **Affects MVP:** Yes (low effort to mitigate).

### R4. Personal data privacy and security
- **Problem:** the app stores info about *third parties* (recipients) who didn't consent; birthdays, interests, notes are personal; leaks would destroy trust; data sent to AI providers.
- **Impact:** High. **Likelihood:** Medium.
- **Mitigation:** data minimization (no sensitive categories by default), ownership checks / row-level security, encrypted transport and storage, clear privacy policy, delete-my-data, avoid sending identifiers to AI, no sharing with stores, restrict free-text notes warnings.
- **Affects MVP:** Yes.

### R5. Reminder delivery reliability
- **Problem:** cron fails/duplicates; time zones (Asia/Tehran, DST history); emails to spam; SMS delivery in some regions unreliable; Jalali vs Gregorian date mapping for yearly repeats; leap-day birthdays.
- **Impact:** High (core promise). **Likelihood:** Medium.
- **Mitigation:** a `reminders` table with status (`pending/sent/failed`) so a daily job is idempotent; store user's time zone; retry failed sends; run job at least daily with catch-up of missed items; log results; yearly repeats follow the Jalali date (✅ Jalali default); send a test reminder in onboarding.
- **Affects MVP:** Yes.

### R6. Scalability and future PWA support
- **Problem:** design choices that block service workers/offline/push later; slow pages; DB queries without indexes.
- **Impact:** Medium. **Likelihood:** Low–Medium.
- **Mitigation:** Next.js supports PWA (manifest, service worker) — keep manifest/icons in mind in folder structure; index by `user_id` and `date`; paginate lists; monolith is sufficient for thousands of users. Web push on iOS needs the app installed to Home Screen (limitation to note).
- **Affects MVP:** Minimal (just don't block it).

### R7. Dependency on third-party services
- **Problem:** outages, price changes, policy changes, regional blocking/sanctions, vendor lock-in.
- **Impact:** Medium–High. **Likelihood:** Medium.
- **Mitigation:** wrap each service behind a small interface (AI, email, product source); keep data exportable in standard Postgres; avoid proprietary features where easy; monitor; check regional availability *before* committing; degrade gracefully (e.g. AI down → show message, keep reminders working).
- **Affects MVP:** Yes.

### R8. (Extra) Beginner-developer maintainability
- **Problem:** too many technologies; AI-generated code inconsistent.
- **Impact:** Medium. **Likelihood:** Medium-High.
- **Mitigation:** small steps, CLAUDE.md rules, minimal dependencies, tests for business logic, one feature at a time.
- **Affects MVP:** Yes.

## 11. Decisions Requiring Approval
1. ✅ Approved: monolith on Next.js with managed services (Supabase, Vercel, Resend, Anthropic). Per-package approval still required.
2. ✅ Database/auth vendor: Supabase (approved). ❓ Iran access to verify.
3. Hosting (Vercel proposed; ❓ **access from Iran not verified** — Vercel/Supabase/Resend/AI providers may be limited for Iran; confirm before approval).
4. Validation library (Zod), Jalali library, font, email provider.
5. Product data strategy for MVP (see API_INTEGRATIONS.md).
