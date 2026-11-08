# KadoBot — External Integrations (Proposal)

**Status:** Research-level draft. **No integration is implemented or tested.** Pricing and availability statements are from general knowledge, may be outdated, and **must be verified** before commitment (marked ⚠).
**Legend:** 💡 Recommendation · 📌 Assumption · ❓ Needs research · 🤝 May need business agreement

All integrations sit behind small internal interfaces (`AIProvider`, `ProductSource`, `EmailSender`, `SmsSender`) so any can be replaced.

## 1. AI Providers / Language Models

✅ **Owner decision:** the AI provider to test first is **Anthropic (Claude)**. 📌 Assumption: still behind a provider-agnostic wrapper so it can be swapped. ❓ Access from Iran (no VPN), pricing, and Persian quality are unverified; owner tests them. 🔐 The SDK/package and API key need separate approval. Only age range, interests, budget, occasion go to the model; never name, email, or exact birth date.
- **Why:** generate personalized gift ideas with explanations.
- **Receives:** minimal profile (relationship, age range, interests, dislikes, occasion type, budget range, optional note). **Returns:** structured JSON list of ideas (title, reason, category, rough price range, search keywords).
- **Official API:** Yes — several providers (OpenAI, Anthropic, Google Gemini, others; also OpenAI-compatible gateways).
- **Cost:** pay per token; for short prompts typically fractions of a cent to a few cents per request ⚠. Small models are much cheaper.
- **Limitations:** Persian quality varies by model; hallucinated products/prices; latency 3–15 s; rate limits; regional availability/sanctions ❓; data-retention policies.
- **Alternatives:** gateway services that route to many models; open-source model self-hosting (more complexity, not for MVP).
- **Research needed:** compare 2–3 models on Persian samples; confirm access from the team's/hosting region; confirm no-training-on-data terms.
- **MVP:** Yes.

## 2. Online Store & Product Discovery 🤝 (highest uncertainty)
- **Why:** deliver the confirmed promise of real products with price, image, store name, link.
- **Receives:** search keywords/category/budget. **Returns:** product title, image URL, price, currency, availability, URL.
- **Official API:** ❓ **Do not assume.** Some global marketplaces have affiliate/product APIs (e.g. Amazon Product Advertising API, eBay Browse API, AliExpress affiliate) with approval conditions ⚠. Many local stores (including in Iran) likely have no public API ❓.
- **Options:**
  | Option | Pros | Cons | MVP fit |
  |---|---|---|---|
  | A. Curated/manual catalog (you or ops add ~100–300 products via spreadsheet/CSV import) | Legal, controllable, accurate, quick | Manual work, limited breadth, stale prices | 💡 **Best for MVP validation** |
  | B. Search-link fallback (AI keywords → store search URLs) | Zero data rights needed, trivial | No images/prices | 💡 Good fallback, launches immediately |
  | C. Affiliate network feeds / store partner feeds (CSV/XML/API) | Legitimate, may earn commission | Needs signup/approval 🤝 | Phase 2 |
  | D. Official marketplace APIs | Large catalog | Region limits, approval, terms on caching/display | Depends on market ❓ |
  | E. Web scraping | Wide coverage | Often violates terms, fragile, legal and blocking risk, image-rights issues | ⛔ Not without explicit approval + legal review |
  | F. Third-party product-data/scraping APIs (e.g. SerpAPI/Google Shopping–style) | No store deals | Cost per query, terms, coverage varies by country ❓ | Evaluate |
- **Cost:** A/B: ~free; C: free-to-join usually; D: usually free with conditions; F: paid per request ⚠.
- **Limitations:** price/stock changes fast; image usage rights; many APIs forbid long-term caching of prices; need to show disclaimers.
- **Business step:** identify 3–5 target stores; contact them about affiliate/partner/feeds. ❓ Which stores matter to your audience?
- **MVP:** Yes, but with option A and/or B first.

## 3. Product Images, Prices, Purchase Links
- Images: use the store's image URLs only where allowed; otherwise host licensed/own images. `next/image` needs allowed domains. 
- Prices: always store with currency and `last_checked_at`; show "may change". 
- Links: validate http/https; open in new tab with `rel="noopener noreferrer sponsored"`; affiliate tags added server-side only.
- Disclose affiliate links. ❓ Legal wording per market.

## 4. Email Notifications
- **Why:** MVP reminder channel (✅ the only one); auth emails (✅ email login).
- **Receives:** recipient address, subject, HTML/text. **Returns:** message ID/status; webhooks for bounces.
- **Official API:** Yes — Resend, Postmark, SendGrid, Amazon SES, Mailgun.
- **Cost:** free tiers typically ~3,000 emails/month or ~100/day; then a few dollars ⚠. SES very cheap.
- **Limitations:** need your own domain with SPF/DKIM/DMARC; spam folders; delivery to some regional providers can be poor ❓; Persian RTL email HTML needs testing (`dir="rtl"`).
- **Alternatives:** Supabase built-in SMTP (limited, for auth only).
- **MVP:** Yes.

## 5. SMS Notifications (⏸ not in MVP — owner decision ✅; Phase 2)
- **Why:** high open rates; common in Persian markets; potential login via OTP.
- **Receives:** phone number, text. **Returns:** delivery status.
- **Official API:** Yes — global (Twilio, Vonage) and, for Iran, local providers (e.g. Kavenegar, Ghasedak, Melipayamak) ❓ verify.
- **Cost:** per-message fee; international SMS can be expensive; local providers cheaper ⚠. Requires prepaid credit.
- **Limitations:** sender-number registration, regulation, opt-in/opt-out requirements, Persian (Unicode) messages are shorter per segment and cost more, delivery issues across borders.
- **Alternatives:** email, push, Telegram bot.
- **MVP:** No (Phase 2) — unless phone OTP login is chosen ❓.

## 6. Push Notifications
- **Why:** free, immediate, in-app feel once PWA exists.
- **Receives:** push subscription + payload (Web Push/VAPID). **Returns:** delivery acknowledgement.
- **Official API:** Web Push standard (free); providers like OneSignal or Firebase Cloud Messaging as wrappers.
- **Cost:** free for standard Web Push; wrappers have free tiers ⚠.
- **Limitations:** needs service worker and HTTPS; iOS only when installed to Home Screen (iOS 16.4+); users must opt in; opt-in rates low; FCM may be blocked in some regions ❓.
- **Alternatives:** email/SMS.
- **MVP:** No (Phase 2 with PWA).

## 7. Scheduling & Reminder Mechanism
- **Why:** trigger reminders at the right time.
- **Design:** `reminders.next_send_at` + a job that runs on a schedule (💡 every hour or daily at user-friendly time), selects due `pending` rows, sends, marks status, retries failures. Idempotent (safe to run twice).
- **Options:** Vercel Cron (simple; limits on free plan ⚠, e.g. daily frequency), Supabase `pg_cron` + Edge Function, GitHub Actions scheduled workflow (free, a few minutes' jitter), external cron services, queue systems like Inngest/QStash (Phase 2+, more reliable retries).
- **Limitations:** cron timing is not exact; time zones; platform free-plan restrictions; failure monitoring needed.
- **MVP:** Yes, simplest option that supports at least daily runs.

## 8. Other Supporting Services (all 🔐 optional)
| Service | Purpose | MVP? |
|---|---|---|
| Sentry | error tracking | Recommended |
| Uptime monitor | outage detection | Recommended |
| Analytics (privacy-friendly, e.g. Plausible/Umami) | success metrics | Optional |
| Captcha/bot protection | signup abuse | Later |

## 9. Summary Table

| Integration | Official API? | Business agreement? | Cost | MVP |
|---|---|---|---|---|
| AI LLM | Yes | No | Pay per use | Yes |
| Product data | ❓ Uncertain | 🤝 Likely | Varies | Yes (curated/links first) |
| Email | Yes | No | Free tier → cheap | Yes |
| SMS | Yes | Sometimes (sender registration) | Per message | No |
| Push | Yes (standard) | No | Free | No |
| Scheduler | Yes (platform) | No | Free tier | Yes |

## 10. Research To-Do (before Gate 4)
1. List target stores & check for affiliate/partner/API programs.
2. Test 2–3 AI models on Persian samples; check regional access.
3. Verify email deliverability to users' main providers.
4. Verify hosting/cron limits on chosen platform.
5. Legal check on affiliate disclosure and product image use.
