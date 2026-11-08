# KadoBot — Product Requirements Document (PRD)

**Status:** Draft v0.4 — owner decisions: email-only login in MVP, exact birth date required, Supabase approved, shopping = direct link (v0.3: Rial, no SMS in MVP)
**Legend:** ✅ Confirmed (from the owner's brief) · 💡 Recommendation · 📌 Assumption · ❓ Open question · 🔐 Needs approval

---

## 0. Market and Language (✅ Confirmed by owner)

- ✅ **Target market: Iran.** KadoBot is designed for users in Iran.
- ✅ **The product is fully Persian (fa), RTL.** All UI text, emails, AI output, errors, and legal pages are in Persian. There is no English or multi-language version in scope.
- ✅ **Price unit: Rial.** All prices and budgets are shown and stored in Rial.
- ✅ **Login (for now): email.** Phone OTP is not part of the MVP.
- ✅ **SMS is not in the MVP.** Email is the only reminder channel in the MVP.
- 💡 Implications (to be confirmed individually; none are decided yet):
  - **Calendar:** Jalali (Persian) calendar is the default for display and input. Gregorian may be kept internally for storage. Yearly repeats follow the Jalali date.
  - **Currency:** Rial (✅). 💡 Store amounts as whole-number Rial; show Persian digits with thousands separators and the label «ریال». Stores that list in Toman need conversion (×10), which must be done carefully.
  - **Digits:** Persian digits in the UI.
  - **Stores:** product sources must be Iranian online stores. ❓ Which ones.
  - **Reminder channel:** email only in the MVP (✅). SMS is deferred to Phase 2 (❓ provider and cost to be researched then).
  - **Login:** email (✅, "for now"). ✅ Email magic link (owner decision), no password. Phone OTP may be reconsidered later. Email deliverability to Iranian users' inboxes must be tested.
  - **Hosting, AI, and email providers:** must be reachable from Iran and usable from Iran. This can limit vendor choices and must be researched before approval (see Open Questions).
  - **Legal/compliance:** Iranian rules for online businesses, data storage, and payments must be checked. ❓ Needs owner/legal review; nothing is assumed here.

---

## 1. Vision and Objectives

**Tagline (✅):** "Remember the occasion. Find the right gift." (Working English line; the product-facing tagline will be written in Persian. ❓ Persian wording to be approved.)

**Vision (✅):** KadoBot is an AI-powered gift discovery and occasion management platform. It helps people remember important occasions and find a personal, fitting gift for the people they care about.

**Objectives**
- ✅ Let users save profiles of important people.
- ✅ Record birthdays and other occasions.
- ✅ Send timely reminders.
- ✅ Give personalized gift recommendations (based on recipient profile, occasion, relationship, budget).
- ✅ Show real products from online stores (price, image, store name, purchase link).
- ✅ Built for Iranian users, fully in Persian.
- 💡 Primary MVP objective: **prove that users value "reminder + personal suggestions" enough to come back.**

## 2. Target Users and Segments

The market is confirmed: **Iran, Persian-speaking users** (✅). The segments below are not confirmed. They are 📌 assumptions to validate with Iranian users.

| Segment | Description | Why they may care |
|---|---|---|
| Busy professionals | 25–45, many people to remember | Forget dates, little time to shop |
| Partners / couples | Want thoughtful gifts | Fear of picking something generic |
| Family organizers | Parents/children/relatives' occasions | Many occasions per year |
| Gift-givers at work | Colleagues, managers, clients | Need safe, appropriate ideas |

✅ Language/market: Iran, fully Persian, RTL. The Iranian diaspora is **not** a target. ❓ Which Iranian stores — see Open Questions. Price unit is Rial (✅).

## 3. Problems Being Solved
1. People forget birthdays and occasions.
2. People don't know what to buy, especially within a budget.
3. Information about the person ("what they like") is scattered in memory or chat.
4. Searching many shops is slow, and ideas aren't personalized.

## 4. Core Capabilities (✅ from brief)
1. Recipient profiles
2. Occasions & dates
3. Reminders
4. AI gift recommendations
5. Real product discovery (price, image, store, link)

## 5. Functional Requirements

Priority: M = MVP proposal, P2 = Phase 2, F = Future. All priorities are 💡 proposals.

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Sign up / sign in with email (✅ for now) | M |
| FR-2 | Create / edit / delete recipient profile (name, relationship, interests, notes) | M |
| FR-3 | Add / edit / delete occasion linked to a recipient (type, date, repeat yearly). Jalali calendar input and display. | M |
| FR-4 | Dashboard of upcoming occasions | M |
| FR-5 | Reminder before an occasion (at least one channel) | M |
| FR-6 | Request gift ideas given recipient + occasion + budget | M |
| FR-7 | Show product results from Iranian stores with image, price (Rial), store, link | M (see §7 risk of data source) |
| FR-8 | Save/favorite gift ideas | P2 |
| FR-9 | Configurable reminder timing & multiple channels | P2 |
| FR-10 | Gift history ("what I gave last year") | P2 |
| FR-11 | Import contacts / birthdays | F |
| FR-12 | Wishlists shared by recipient | F |
| FR-13 | PWA install + push notifications | P2/F |
| FR-14 | Price tracking, affiliate revenue, gift-card/direct purchase | F |

## 6. Non-Functional Requirements
- ✅ Mobile-first, responsive.
- ✅ Fully Persian + RTL from day one. Persian is the only language in scope.
- 💡 Persian digits, Jalali calendar, and Persian text handling (ZWNJ, mixed RTL/LTR) everywhere, including emails and AI output.
- 💡 Must work for users inside Iran (network conditions, reachable services). ❓ To be verified per vendor.
- ✅ Future PWA support.
- 💡 Page loads usable on mid-range phones with mediocre networks (target: main screens < 3 s on 4G).
- 💡 Reminders must be reliable (no silent misses) — see risks.
- 💡 Personal data minimized, encrypted in transit, access-controlled per user.
- 💡 Accessibility: WCAG 2.1 AA as a goal.
- 💡 AI cost capped per user per day.
- 💡 Simple to maintain by one beginner developer.

## 7. User Needs & Business Assumptions
**User needs (📌):** don't be embarrassed by forgetting; gifts feel personal; quick (under 2 minutes to get ideas); trust that suggestions are real, buyable and in budget.

**Business assumptions (📌, none confirmed):**
- ✅ **MVP is free for users** (owner decision). No payment, subscription, or paid features in MVP.
- 📌 Revenue model is deferred. Candidates for later: affiliate commissions, premium subscription, store partnerships. ❓ Payment options in Iran must be researched before any paid feature.
- Real product data from Iranian stores may be hard to obtain (API availability unknown); the MVP may need a curated/manual or limited source.
- Users will accept entering a few details about each recipient.

## 8. MVP SCOPE (🔐 proposal — requires approval)

Goal: test the core value — *"I get reminded, and I quickly get a good gift idea I can click to buy."* — with the least build effort for one beginner developer using Claude Code.

### 8.1 MVP — Essential for first release

| # | Feature | Why necessary | User problem solved | Complexity | Dependencies | Essential? |
|---|---|---|---|---|---|---|
| 1 | Fully Persian/RTL app shell, responsive layout | Confirmed core requirement; retrofitting is painful | Usable in own language on phone | Low–Med | Project setup, fonts | Essential |
| 2 | Sign-up/login with email (✅ email magic link, no password) | Data must be private per user | Keeps people's data safe | Med | Auth + DB | Essential |
| 3 | Recipient profiles (name, relationship, age range, interests, notes) | Basis for personalization | Gift ideas fitting the person | Low | DB, auth | Essential |
| 4 | Occasions (birthday + custom, Jalali date, yearly repeat) | Core promise: remember | Forgetting dates | Low–Med | Recipients | Essential |
| 5 | Upcoming-occasions home screen | Where users return | Seeing what's next | Low | Occasions | Essential |
| 6 | One reminder channel: email (✅; SMS is not in MVP) | Core promise: timely reminder | Missing the date | Med | Occasions, email service, scheduler | Essential |
| 7 | AI gift ideas in Persian (text ideas with reasons, given recipient+occasion+budget in Rial) | Core differentiator | Not knowing what to buy | Med | AI provider, profile data | Essential |
| 8 | Product matching: show real products with image/price/store/link from **one Iranian store source** (curated list, one partner feed, or search link) | Confirmed promise of real products | "Where do I buy it?" | **High/Uncertain** | Research on store data (❓) | Essential, but source open |
| 9 | Delete account / my data | Privacy trust, legal safety | Control over personal data | Low | Auth, DB | Essential |

💡 Fallback for #8 if no product data is available: AI gives idea categories → app builds **search links** to Iranian stores (no prices/images). This is honest and cheap, and can launch while data deals are explored.

### 8.2 Phase 2 — Improvements
- SMS reminders (cost, ❓ provider) and configurable timing/multiple reminders per occasion.
- Saved/favorite gifts and gift history.
- Feedback on suggestions (👍/👎) to improve quality.
- PWA install + web push.
- More product sources; price refresh.
- Calendar export (ICS) with correct Jalali-aware dates.
- ❌ English UI is **not planned**: the product is fully Persian (✅). It may be reconsidered only if the owner changes the scope.

### 8.3 Future Features
- Contact/calendar import, social-based interest hints (privacy-heavy).
- Shared wishlists, group gifting.
- Price tracking/alerts, affiliate dashboard.
- Native mobile apps, Telegram/WhatsApp bot reminders.
- Gift ordering/delivery in-app.

### 8.4 Explicitly out of MVP
Payments, native apps, admin dashboard (use DB console), any non-Persian language, social features, push, **SMS (✅ confirmed out)**, phone-number login.

## 9. Success Metrics (💡 proposals)
- % of signed-up users who add ≥1 recipient and ≥1 occasion.
- % who request gift ideas; % who click a product link.
- Reminder → return-visit rate.
- Week-4 retention.

## 10. Open Product Questions (❓)
1. ✅ Answered: Iran, fully Persian, price unit Rial. Still open: which Iranian online stores are relevant?
2. Jalali calendar as default (💡 yes, from MVP, since the market is Iran). Should Gregorian dates also be shown anywhere? See Architecture.
3. ✅ Answered: email login for now; exact birth date required. ✅ Magic link chosen. Still open: can email reliably reach Iranian users?
4. ✅ MVP free; revenue model deferred (affiliate, subscription, ads still open for later).
5. Where does product data come from? Any existing relationships with Iranian stores?
6. ✅ Answered for MVP: email only, no SMS. Later: which channel (SMS, Telegram/Eitaa/Bale) in Phase 2?
7. Should recipients ever be notified/see anything? (💡 No, private by default.)
8. How sensitive is data like religion, health, or age? What may be stored?
9. Brand name/domain/logo status?
10. Budget for monthly infrastructure and AI?
11. Hosting and vendors: which services are reachable from and usable in Iran (hosting, database, AI, email/SMS)? ✅ Data residency: data may be stored inside Iran or outside Iran (owner decision). Which legal requirements apply to an online service in Iran? ❓
12. Is the app free in MVP?
