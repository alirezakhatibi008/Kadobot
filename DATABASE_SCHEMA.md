# KadoBot — Database Schema (Proposal)

**Status:** Draft v0.2 (aligned with PRD v0.3: Iran, fully Persian, Rial, email login, no SMS in MVP). **Nothing is created; no migrations exist.**
**Legend:** ✅ Confirmed (entity is implied by the brief) · 💡 Proposed field/table · 📌 Assumption · ❓ Open · 🔐 Approval

## 1. Confirmed vs. proposed
**✅ Confirmed entities (from the brief):** users, recipient profiles, occasions (birthdays etc.), reminders, gift preferences, products, stores, AI recommendation history.
**💡 Everything below — exact tables and fields — is a proposal.** Field lists are intentionally small. "MVP" = needed in first release.

## 2. Relationships (simple diagram)
```
users 1──* recipients 1──* occasions 1──* reminders
                │                 │
                │ 1──* recipient_interests (gift preferences)
                │
                └──* recommendation_requests 1──* recommendation_items ──?─ products *──1 stores
                                                                      └─ favorites (Phase 2)
```
Plain words: a user has many people; each person has many occasions and interests; each occasion has reminders; each time the user asks for ideas we store the request and its resulting ideas, optionally linked to real products from stores.

## 3. Tables

Common fields on every table (💡): `id` (UUID), `created_at`, `updated_at`.

### `users` (MVP)
Handled mostly by the auth service. App-level profile table `profiles`:
| Field | Type | Notes |
|---|---|---|
| id | uuid | = auth user id |
| display_name | text | optional |
| locale | text | ✅ fixed `fa` (only language) |
| timezone | text | default `Asia/Tehran` 📌 |
| calendar_preference | text | default `jalali` ✅ (Jalali is the default) |
| reminder_email_enabled | bool | |
| deleted_at | timestamp | soft-delete grace period (optional) |

### `recipients` (MVP)
| Field | Type | Notes |
|---|---|---|
| user_id | uuid FK | owner; index |
| name | text | required |
| relationship | text/enum | partner, parent, friend, colleague, … |
| gender | text | optional ❓ (useful for recs, sensitive) |
| birth_date | date | ✅ exact birth date required (owner). Collect minimum; store only what's needed for reminders |
| notes | text | free text, user-private; max length |
| dislikes | text | things to avoid |

### `recipient_interests` — gift preferences (MVP)
| Field | Type | Notes |
|---|---|---|
| recipient_id | uuid FK | |
| label | text | "coffee", "hiking" |
| type | text | `like` / `dislike` |
💡 Simpler alternative: a single text-array column on `recipients`. Start there if you want fewer tables (🔐 decision).

### `occasions` (MVP)
| Field | Type | Notes |
|---|---|---|
| recipient_id | uuid FK | |
| user_id | uuid FK | denormalized for fast, safe access checks |
| type | text | birthday, anniversary, custom… |
| title | text | for custom |
| month, day, year | int | ✅ exact date required; year stored for the birthday (owner decision). Calendar conversion in code |
| calendar | text | `jalali` (default ✅) / `gregorian` — which calendar the date is in; yearly repeat follows it |
| repeats_yearly | bool | |
| default_budget_min/max | bigint | optional, whole **Rial** (✅); no currency column in MVP |

### `reminders` (MVP)
| Field | Type | Notes |
|---|---|---|
| occasion_id | uuid FK | |
| user_id | uuid FK | |
| days_before | int | e.g. 7 |
| channel | text | `email` (✅ only channel in MVP); `sms`, `push` later |
| next_send_at | timestamptz | computed; indexed |
| last_sent_at | timestamptz | |
| status | text | pending / sent / failed |
| attempt_count, last_error | int, text | for retries |
💡 Possibly a separate `reminder_deliveries` log table to make the daily job idempotent (Phase 2 if MVP keeps simple status).

### `recommendation_requests` (MVP)
| Field | Type | Notes |
|---|---|---|
| user_id, recipient_id, occasion_id? | FK | |
| budget_min/max | bigint | whole Rial |
| extra_note | text | optional user input |
| ai_provider, ai_model | text | for cost/quality tracking |
| prompt_version | text | |
| input_tokens, output_tokens | int | cost control |
| status | text | |

### `recommendation_items` (MVP)
| Field | Type | Notes |
|---|---|---|
| request_id | FK | |
| title, reason | text | AI idea + why |
| category | text | |
| est_price_min/max | bigint | AI estimate in Rial, **not** a real price |
| search_keywords | text | for product matching |
| product_id | FK nullable | matched real product |
| feedback | text | 👍/👎 (Phase 2) |

### `stores` (MVP, small)
| Field | Notes |
|---|---|
| name, domain, logo_url | Iranian stores (✅ market) |
| integration_type | `api`, `affiliate_feed`, `manual`, `search_link` |
| is_active | |
| terms_notes | legal/permission notes |

### `products` (MVP, shape depends on ❓ data source)
| Field | Notes |
|---|---|
| store_id FK | |
| external_id | store's ID |
| title, description | |
| image_url | respect store terms (hotlink vs. hosting) |
| price | whole Rial (✅); if a store lists Toman, convert ×10 at import |
| product_url | purchase link |
| affiliate_url | optional |
| availability | in_stock/unknown |
| last_checked_at | freshness |
| raw_data (jsonb) | optional |

### `favorites` / `saved_gifts` (Phase 2)
`user_id`, `recipient_id`, `product_id` or `recommendation_item_id`, `note`.

### `gift_history` (Phase 2)
`recipient_id`, `occasion_id`, `description`, `product_id?`, `given_on`, `rating`.

### `link_clicks` (optional, MVP-light)
`user_id`, `product_id`, `clicked_at` — measures a key success metric and later supports affiliate attribution.

### `usage_limits` (MVP, could be simple counters)
`user_id`, `date`, `ai_requests_count` — enforce AI cost caps.

## 4. Indexes (💡)
`recipients(user_id)`, `occasions(user_id)`, `reminders(next_send_at) where status='pending'`, `products(store_id, external_id)` unique.

## 5. Data Privacy Considerations
- Data about recipients is **third-party personal data**: collect the minimum. Avoid sensitive categories (health, religion, politics, sexual orientation). ✅ Exact birth date is required (owner decision); keep it private and minimal, never sent to AI.
- **Row-level isolation:** every user-owned table filtered by `user_id`; DB policies (if Supabase RLS) plus server checks.
- **Deletion:** ✅ self-service account delete; user data (account, recipients, occasions, reminders, history) is removed or anonymized within **90 days** of the request. 💡 Implement as a scheduled purge job; backups expire on their own schedule (disclosed).
- **AI:** send only needed fields; no emails/phones/last names; keep prompt logs off or redacted; check provider's data-retention/training policy (opt-out of training).
- **Encryption:** TLS in transit; provider-managed encryption at rest; 💡 consider column-level encryption for `notes` later.
- **Retention:** ✅ 90 days after deletion request (account data). ❓ Retention for recommendation history and logs while the account is active.
- **Backups:** managed daily backups; backups also contain personal data → deletion lag disclosed in privacy policy.
- **Legal:** privacy policy and terms before public launch; ❓ Iranian rules apply (target market is Iran); needs legal review.
- **Products/stores** tables hold no personal data.

## 6. Open Questions
1. Jalali is the default (✅). 💡 Store month/day + calendar flag; compute next Gregorian date. Library choice needs approval.
2. ✅ Answered: exact birth date is required.
3. Separate interests table vs. simple array?
4. What does the product data source provide? (decides `products` columns).
5. ✅ Account deletion: 90 days (owner). ❓ Retention for logs and history while active.

## 7. Approval Needed
Table list for MVP; DB vendor; Jalali handling approach. **No migration will be written until approved.**
