# KadoBot — Development Roadmap

**Status:** Draft v0.1 — all proposals, 🔐 require approval. Timelines are 📌 rough estimates for one beginner developer working with Claude Code (part-time effort may be slower).

## 1. MVP Definition (🔐 proposal; mirrors PRD §8)

### MVP — Essential
| Feature | Why | Complexity | Depends on | Essential? |
|---|---|---|---|---|
| RTL/Persian responsive shell | Core requirement | Low–Med | Project setup | Yes |
| Auth (email) | Data privacy | Med | DB/auth vendor | Yes |
| Recipient profiles | Personalization base | Low | Auth, DB | Yes |
| Occasions (Jalali-aware) | "Remember the occasion" | Low–Med | Recipients | Yes |
| Home: upcoming occasions | Return point | Low | Occasions | Yes |
| Email reminder + daily scheduler | Timely reminders | Med | Occasions, email service | Yes |
| AI gift ideas | Differentiator | Med | AI provider | Yes |
| Product display from ONE source (or search-link fallback) | "Real products" promise | High/Uncertain | Product data research | Yes (source flexible) |
| Delete account | Privacy | Low | Auth | Yes |

### Phase 2 — Improvements
SMS reminders · multiple/custom reminders · saved gifts · gift history · suggestion feedback · PWA install + push · more stores + price refresh · calendar export · basic admin view · analytics.

### Future
Contact import · shared wishlists/group gifts · price alerts · affiliate dashboard · Telegram/WhatsApp reminders · native apps · in-app ordering.

**Out of MVP:** payments, push, SMS (✅), phone login (✅), admin dashboard, social features. The product is Persian-only (✅); no English UI planned.

## 2. Phases

### Phase 0 — Foundations (✅ docs done; this step)
Inspection and documentation. **Gate: your approval.**

### Phase 1 — Project Setup & Design Base (est. 1 week)
- Create Next.js + TypeScript + Tailwind project, lint/format, git, `.env.example`.
- RTL root layout, Persian font, design tokens, style-tile page.
- Deploy empty app to preview hosting.
- **Milestone M1:** Persian RTL style tile viewable on your phone via a live URL.

### Phase 2 (Dev) — Accounts & Data Core (est. 1–2 weeks)
- DB + auth setup, migrations (after schema approval).
- Sign up/in, protected routes, settings, delete account.
- **M2:** You can sign up and see an empty home screen.

### Phase 3 — People & Occasions (est. 1–2 weeks)
- Recipient CRUD, occasion CRUD, Jalali date input, home timeline.
- Unit tests for date/next-occurrence logic.
- **M3:** Add people and occasions; see what's coming up.

### Phase 4 — Reminders (est. 1 week)
- Reminder settings, scheduler, email sending, idempotency/retry, test email.
- **M4:** Real reminder email arrives at the right time.

### Phase 5 — Product Source Spike (can start in parallel from Phase 1; research is business-side)
- Decide product data approach (see API_INTEGRATIONS.md). Prototype with one source or curated list.
- **M5:** Written decision + sample real products retrievable.

### Phase 6 — AI Gift Ideas (est. 1–2 weeks)
- AI provider wrapper, prompts, structured output, daily limits, history save.
- Results UI, product matching or search-link fallback, click tracking.
- **M6:** End-to-end: person → occasion → ideas → click to store.

### Phase 7 — Polish, Security, Beta (est. 1–2 weeks)
- Accessibility pass, mobile device testing, error states, privacy policy/terms, rate limits, monitoring.
- **M7 / MVP Release:** private beta with 10–30 real users.

### Phase 8 — Validate & Phase 2 features
Review metrics and feedback, then prioritize Phase 2 items.

## 3. Dependencies
```
Approval → Setup → DB/Auth → People → Occasions → Reminders
                                   └────────────→ AI Ideas → Product display → Beta
Product-source research (parallel) ─────────────→ Product display
Email vendor decision ───────────────────────────→ Reminders
Palette decision ────────────────────────────────→ Setup design tokens
```
Critical risks to schedule: product data availability (R2), Persian AI quality (R3), hosting/provider accessibility (R7).

## 4. Suggested Implementation Order
1. Setup & RTL base → 2. Auth → 3. Recipients → 4. Occasions → 5. Home → 6. Reminders → 7. AI ideas → 8. Products → 9. Polish/beta.
Rationale: reminders deliver value without AI/products, so the product is useful early and the riskiest piece (products) is researched in parallel.

## 5. Testing Strategy
- **Unit tests (Vitest)** for business logic: date/Jalali conversion, next-reminder calculation, budget parsing, AI-output validation.
- **Component checks:** manual RTL and mobile checks on each screen (checklist in CLAUDE.md).
- **End-to-end (Playwright)** for 3 critical flows: sign up → add person/occasion; reminder trigger (test mode); get ideas.
- **Manual device testing:** real iPhone and Android, slow network.
- **AI evaluation:** a fixed set of ~20 sample recipients; review Persian output quality and cost.
- **Reminder testing:** simulate times; verify no duplicates/misses.
- Don't claim an integration works until tested end-to-end.

## 6. Release Strategy
- Environments: local → preview (every branch) → production.
- Small, reviewable commits; each phase merged only after its milestone check.
- Private beta (invite-only) → fix → public launch.
- Feature flags are not needed for MVP; keep it simple.
- Rollback: redeploy previous version (hosting supports instant rollback); DB changes forward-compatible.
- Post-release: monitor errors, email delivery, AI spend weekly.

## 7. Approval Gates
Gate 0: this documentation → Gate 1: tech stack and vendors → Gate 2: palette/design tokens → Gate 3: DB schema before first migration → Gate 4: product-data approach → Gate 5: beta launch.
