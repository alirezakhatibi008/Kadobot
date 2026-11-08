# KadoBot — User Flows (Proposal)

**Status:** Draft v0.2 (aligned with PRD v0.3: Iran market, fully Persian, Rial, email login, no SMS in MVP). All flows are 💡 proposals unless the brief confirms the capability (✅ registration, recipient profiles, occasions, reminders, recommendations, product browsing, purchase links). Screen details and wording are ❓ for design.

## 1. Registration and Onboarding
```
Landing page → "Start" → Sign up (✅ email only for now; phone login not in MVP)
   → verify (✅ magic link sent to email; no password)
   → Welcome: 1 short screen explaining value
   → "Add your first person" (name, relationship)
   → "Add their birthday" (✅ exact date required)
   → "Choose reminder: 7 days before? (email)"
   → Home (upcoming occasions) + prompt "Get gift ideas"
```
Principles: ≤ 3 steps to first value; skippable; no long forms; explain why we ask each thing (privacy trust). Edge cases: unverified email, expired link, duplicate account.

## 2. Create Recipient Profile
```
Home → "+ Add person"
   → Name (required)
   → Relationship (chips: partner, parent, friend, colleague…)
   → Optional: age range, interests (tag chips + free text), things to avoid, notes
   → Save → Person page
```
Edit/delete from the person page. Delete asks for confirmation and explains that occasions/reminders go too. Fields beyond name/relationship are optional so users can start fast; the app nudges later ("add interests for better ideas").

## 3. Add Important Occasion
```
Person page → "+ Add occasion"
   → Type (birthday / anniversary / custom)
   → Date (✅ Jalali picker by default; yearly repeat follows the Jalali date)
   → Repeat every year? (default yes)
   → Reminder (default 7 days before) → Save
   → Appears on Home timeline
```
Edge cases: leap day, date in the past (next occurrence computed), unknown year.

## 4. Manage Reminders
```
Occasion → Reminder settings → pick days before (MVP: one value) → channel (MVP: email)
Background:  Daily scheduler → finds due reminders → sends → marks sent/failed → retries
User receives email: "Sara's birthday is in 7 days" → [See gift ideas] deep link
```
MVP reminder channel is email only (✅). Phase 2: multiple reminders, SMS, push, quiet hours, snooze. Reminder email always contains a link directly to the gift-idea flow.

## 5. Request Personalized Gift Recommendations
```
Entry points: Home card / Person page / Reminder email
   → Confirm: person + occasion (prefilled)
   → Budget (range slider or chips; ✅ amounts in Rial, Persian digits) 
   → Optional note ("she just started yoga")
   → "Find gifts" → loading state (friendly, <10s)
   → Results: gift ideas, each with short "why this fits"
   → Per idea: matching products (see §6)
   → "More ideas" / refine (daily limit message if reached)
```
Failure paths: AI timeout → retry button; limit reached → clear message with reset time; no products found → show idea + store search links.

## 6. Browse and Select Products
```
Idea card → Product list (image, title, price, store name)
   → Tap product → detail sheet (bigger image, price, store, "price may have changed", reason)
   → [Go to store]  (opens new tab)
   → (Phase 2) ♥ Save for later
```
Honesty rule: show "last updated" and a note that price/stock are controlled by the store.

## 7. Follow Purchase Links
```
[Go to store] → app records click (anonymous metric) → opens store URL in new tab (affiliate URL if available ❓)
   → user returns to KadoBot → (Phase 2) prompt "Did you buy this? Save to gift history"
```
Disclose affiliate relationships if used.

## 8. Other minimal flows
- **Login/logout**, **forgot access**.
- **Delete account** (Settings → confirm → data erased).
- **Empty states**: no people yet, no occasions, no results — each with one clear next action.

## 9. Open Questions
- ✅ Magic link chosen. (Login is email; Jalali is default.) Entry via reminder email deep link requires login — acceptable?
- Is buying tracked in any way beyond clicks?
