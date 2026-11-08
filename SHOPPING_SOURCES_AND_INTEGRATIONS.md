# KadoBot — Shopping Sources & Integrations

**Status:** Draft v0.3. ✅ MVP = direct link only (owner approved). ✅ Store list of 10 with websites (owner). Priorities and link patterns still 💡/❓ until verified.
**Legend:** ✅ Confirmed · 💡 Recommendation · 📌 Assumption · ❓ Open/unverified · 🔐 Approval needed

> ✅ **Owner approved all open items (ترتیب فروشگاه‌ها، فیلدهای جدول، لینک‌ها فقط برای MVP).** Access/terms checks still noted below.

> ⚠ **Nothing in this document was verified against the stores' real sites, APIs, or terms.** Columns marked ❓ must be checked by a human (or by an approved research step) before any work starts. No scraping, no API connection, no code until approved.

## 1. MVP Decision
✅ **MVP method = direct product link.** KadoBot shows a gift idea and sends the user to the store's page (a product page if we have a link, otherwise a store search page). KadoBot does **not** fetch, store, or display live prices, stock, or images from stores in MVP.
💡 Consequences: no scraping, no store contracts needed for MVP, no stale-price risk. Trade-off: the experience is less rich (no price/image on our side), and "real product with price" from the brief is deferred (Phase 2).
❓ Confirm with owner: is showing no price/image in MVP acceptable? (The brief lists price/image/store/link; this is a deliberate MVP reduction.)

Link types (💡):
| Type | Example | Notes |
|---|---|---|
| `search_link` | `store.com/search?q=<AI keywords>` | Works without permission from the store; ❓ verify each store's URL pattern |
| `product_link` | exact product URL | Only if the owner/team curates it manually |
| `affiliate_link` | link with partner code | ❓ only if a store has an affiliate program; disclose to users |

AI must never invent product names, prices, or URLs. It outputs *idea + search keywords*; the link is built by our code from the store's known URL pattern.

## 2. Architecture Rule (✅ owner request)
Stores are **data, not code paths**. Adding a store must not touch AI or recommendation logic.

```
AI ideas (title, reason, keywords, budget)
        ↓
Recommendation service  ──asks──►  SourceRegistry (list of active stores)
                                        ↓
                          ProductSource adapter (one per store/type)
                                        ↓
                          Result: { store, label, url, [title, price, image]? }
```
- 💡 `stores` table (see DATABASE_SCHEMA) holds: name, domain, `integration_type`, `search_url_template`, `is_active`, `priority`, `categories`, `terms_notes`.
- 💡 Interface `ProductSource.find(query) → links/products`. MVP has one generic adapter: `SearchLinkSource`, driven only by the store's `search_url_template` (e.g. `https://example.ir/search?q={query}`). **A new store = one new database row, zero new code.**
- 💡 Richer adapters (`api`, `feed`, `manual`) added later behind the same interface; AI code never changes.
- 💡 Store choice per idea: match idea `category` with store `categories`, then order by `priority`.

## 3. Store List
Integration facts below are ❓ unless stated. "Data we can get" for MVP is only what we ourselves build (a link).

| # | Store | Website ✅ | Role | Method in MVP | Possible later method ❓ | Data in MVP | Known/likely limits ❓ | Priority (owner rank) ✅ |
|---|---|---|---|---|---|---|---|---|
| 1 | دیجی‌کالا | digikala.com | General products | `search_link` | Partner/affiliate program or API — unverified | Link only | Terms on linking/affiliate unknown; large catalog | **۱** |
| 2 | باسلام | basalam.com | Unique / handmade gifts | `search_link` | Unverified | Link only | Many sellers; quality varies | **۲** |
| 3 | ترب | torob.com | Price comparison | `search_link` | Unverified | Link only | Aggregator; fits "compare price" step | **۳** |
| 4 | دیجی‌استایل | digistyle.com | Fashion & accessories | `search_link` | Unverified | Link only | Sizing issue for gifts | **۴** |
| 5 | گل‌گیفت | golgift.com | Flowers & occasion gifts | `search_link` | Unverified | Link only | Delivery date/city matters | **۵** |
| 6 | خانومی | khanoumi.com | Beauty | `search_link` | Unverified | Link only | Sensitive: skin/allergy advice | **۶** |
| 7 | طاقچه | taaghche.com | Cultural gifts (books/ebooks) | `search_link` | Unverified | Link only | Digital goods: gift flow may differ | **۷** |
| 8 | اسنپ‌شاپ | snapp.shop | Gift link (same as other stores) | `search_link` | Unverified | Link only | — | **۸** |
| 9 | تپسی‌شاپ | tapsi.shop | Gift link (same as other stores) | `search_link` | Unverified | Link only | — | **۹** |
| 10 | جانبی | janebi.com | Gift link (same as other stores) | `search_link` | Unverified | Link only | — | **۱۰** |

Priority ✅ (owner ranking): the order is the owner's rank, 1 = first to verify and test. Since adding a store is just a row, the rank sets **what to verify and test first**, not code effort.
✅ Owner ranking and websites confirmed. ✅ Stores 8–10 are in MVP (owner decision). Websites are owner-provided and not yet tested.

## 4. Phase Plan for Data Depth
| Phase | Data | Method |
|---|---|---|
| MVP ✅ | Link to store search/product page | `search_link` (+ manual `product_link` for a few curated items) |
| Phase 2 💡 | Title, price (Rial), image | Official API/feed **only if** a store offers one with written permission; else manual curation |
| Later 💡 | Price comparison across stores | Via ترب or approved feeds |

🔐 Scraping: **not allowed** until owner approves per store after reading its terms of use and a legal check. Robots/ToS violations are a real risk (R2 in roadmap).

## 5. Legal & Trust Notes
- ❓ Check each store's terms about deep-linking and use of its name/logo (use plain text names in MVP, no logos).
- ❓ Affiliate links need clear disclosure to users.
- ✅ No user personal data is sent to stores; the link contains only search keywords (💡 no recipient name/age in the query).
- 💡 Open links in a new tab; show "you are leaving KadoBot to <store>".
- 💡 Track outbound clicks (store, idea id) without personal data, to learn which stores work.

## 6. Verification Checklist (before enabling each store) ❓
1. Does the site have a search URL pattern that accepts Persian text? Test with 3 queries.
2. Does the link work on mobile without login?
3. Terms of use: is linking/affiliate allowed? Is there a partner program or API?
4. Is the store reachable from typical Iranian networks (and from our server, if hosted abroad)?
5. Record result in `terms_notes`, then set `is_active = true`.

## 7. Open Questions
1. ✅ MVP without price/image on our side: approved.
2. ✅ Priorities confirmed (owner ranking). ✅ Stores 8–10 are in MVP.
3. Should ترب be treated as a store or a later comparison feature?
4. Who verifies each store's terms (owner, or an approved research step)?
5. ✅ MVP is free; affiliate decision deferred. Affects link type only after MVP. ❓

## 8. Approval Needed 🔐
✅ Approved: MVP = link-only; 10-store ranked list with websites. 🔐 Still needed: `stores` fields in §2; the "stores are data" rule (owner's request, to confirm).
