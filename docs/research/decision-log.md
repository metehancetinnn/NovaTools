# Decision log

Stable IDs. Each entry: date, decision, evidence, alternatives rejected, status, follow-up.
Evidence IDs (EV-xxx, NICHE-xx, FEAT-xx, PAGE-xxx, LEGAL-xx) refer to the CSVs in this folder.

## D-001 — Root cause of the AdSense "low-value content" rejections is identity, not markup (2026-11-27)
- **Evidence:** live sitemap on 2026-11-26 was 26 commodity tools plus 30 blog
  posts, 24 of them US personal-finance/insurance/tax guides with no supporting
  expertise or tools; `tools-manifest.json` carries CPC targets per tool;
  page-audit.csv found template "guides" with draft text, ~200 indexable `/ar/`
  copies and several self-canonical duplicates. Technical issues were already
  fixed in #285/#286 and the site was still rejected.
- **Decision:** treat it as a product-identity problem: one original product,
  remove or de-index everything that exists to target keywords.
- **Status:** in progress (D-002…D-008).

## D-002 — Primary direction: pre-send leak check for files, led by PDF redaction verification (2026-11-27)
- **Evidence:** niche-scoring-model.md — 18 hypotheses, 11 researched; top four
  (NICHE-03 redaction verifier 75.4, NICHE-09 GPX trimmer 71.4, NICHE-01
  Share-Safe 70.4, NICHE-05 HAR sanitizer 68.8) are all "before you share a
  file" jobs on one engine and stayed on top under three alternative weightings.
- **Rejected:** browser PDF suite (incumbents), AI/GEO readiness checker (hype,
  no demand evidence), photo-EXIF-only remover (saturated), calculators
  portfolio (stop investing), RLSProof as the lead (small audience; kept).
- **Adjacent expansion:** GPX/TCX route privacy trim (FEAT-11), not built yet.
- **Status:** accepted. Share-Safe survives, repositioned around verification.

## D-003 — Homepage leads with the product and stops growing per tool (2026-11-27, commit 6fd4caa1)
- **Evidence:** `renderFeaturedTools()` listed every certified tool (~250 px per
  card at 375 px); the e2e height budget had been raised 4× (12161 → 12653 →
  12900 → 13150), each time to fit one more tool. The test was being moved to
  fit the defect.
- **Decision:** fixed six-card "before you send" shortlist; the test asserts
  ≤6 cards and the height budget returns to a fixed 9,400 px (measured 8.4k).
  The hero badge test now sums category counts instead of featured cards.
- **Also:** three homepage blog cards with different titles all opened one
  article → each now opens a distinct published article; `src/js/seo.js`
  replaced the title at runtime with "110+ free online tools" (27 certified)
  → copy now matches the static page.

## D-004 — Build FEAT-01 by rendering pages, not by parsing PDF operators (2026-11-27, commit eff533aa)
- **Why:** operator parsing must track graphics state, transforms, annotations
  and XObjects; rendering with the already-bundled pdf.js and testing each word
  area for visible contrast catches the same failures (and white-out, and
  annotation-drawn boxes) with ~80 lines of pure, testable code.
- **Trade-off:** word positions are estimated proportionally within a text run,
  so word-level hits are accepted only for dark covers; light/coloured covers
  must cover the whole run. Limited to the first 60 pages, and the report says
  so when pages are skipped. Hidden text is reported, never "fixed": PDF Redact
  rebuilds pages as images.

## D-005 — Retire the off-topic blog and the 1–2-post category archives (2026-11-27, commit a52093c7)
- 24 out-of-scope articles marked `UNPUBLISHED_OUT_OF_SCOPE` (reversible);
  five blog category archives removed with 301s; 24 duplicate related-guide
  cards de-duplicated; 89 internal links repaired.

## D-006 — Retire the template `/guides/` cluster; de-index duplicate copies (2026-11-27)
- **Evidence (live, 2026-11-27):** `/guides/articles/*` 200 + `index, follow`,
  text identical under each heading with "publish-ready outline and article
  draft"; `/ar/*` 200, self-canonical, English static HTML; `/about`,
  `/blog/article-template` and `/blog/<slug>` 200, self-canonical duplicates.
- **Decision:** delete guide sources and every link to them (site-wide nav,
  30 tool-page asides); 301 `/guides/*` → `/blog/`, `/site-map/topical` →
  `/categories/`; 301 duplicates to their canonical URL; `X-Robots-Tag:
  noindex, follow` for `/ar/*` with the global `index, follow` detached
  (Cloudflare joins repeated values; docs checked 2026-11-27).
- **Not done (needs build-pipeline change, see risk register R-03/R-04):**
  stop generating `/ar/` and `/<page>/index.html` copies; sitemap `.html` URLs.

## D-007 — Remove the dead "Additional routes" block from /categories/ (2026-11-27)
- All five links went to withheld placeholders (noindex) or 404 demo routes.

## D-008 — Measure activation with consent-gated, coarse events only (2026-11-27)
- Share-Safe sends `tool_success` (mode scan/clean, file type, size bucket,
  counts, re-check pass) and `result_download` only when gtag exists, which is
  only after analytics consent. Never file names, contents or findings text;
  disclosed on the page and enforced by tests/share-safe-check.mjs.

## D-009 — Monetization stays off until the tax position is confirmed (2026-11-27)
- **Evidence:** legal-tax-feasibility.md / legal-risk-matrix.csv: 20/B covers
  ad, sponsorship, donation and subscription income in its communiqué, but no
  post-2024 ruling covers AdSense on a tool site; Bağ-Kur effect unresolved;
  paid features via Paddle are probably ordinary business income.
- **Decision:** request an özelge through a mali müşavir before any revenue;
  no paid tier now; certified TCF v2.3 CMP before EEA personalised ads.

## D-010 — "LPC" credential claim: flagged, not removed site-wide (2026-11-27)
- The homepage schema/meta no longer show it (consistent with Analytics.mjs),
  but ~170 files still show "Licensed Professional Counselor" / "LPC". Only the
  owner can confirm whether that licence is held; removal is a one-commit job
  once confirmed. Owner action listed in progress.md.

---
# Product reset (2026-11-27/28)

The owner rejected the file-utility direction (D-001..D-004, D-008 depend on it)
and clarified the credential. D-011..D-015 supersede them where they conflict.

## D-011 — Remove the LPC credential; state the real title (commit fe6dfa10)
- **Owner statement:** Psychological Counselor and Guidance Teacher in Türkiye; no US
  LPC licence. Supersedes D-010.
- **Done:** "LPC" / "Licensed Professional Counselor" removed from 169 source files
  (meta author, JSON-LD, footers, locales, `src/core/config.mjs`). The author and
  about pages state the Turkish title, say it is not a foreign licence, and say the
  site offers no counselling or therapy. `tests/public-claim-policy.mjs` fails if
  the title returns.

## D-012 — Retire the PDF, image and generic file tools and Share-Safe (410, not 301)
- **Owner decision:** no PDF/file converters, compressors, mergers or editors, no
  generic file-safety checker.
- **Handling per URL:** no equivalent replacement exists on the site, so the routes
  answer **410 Gone** (Pages Function `functions/{tools,categories,blog/articles}/[[path]].js`,
  list in `src/server/http/retired-routes.mjs`, test `tests/retired-routes.mjs`).
  Nothing is redirected to the homepage. Withheld articles (already 404) stay 404.
- **Scope:** `/tools/pdf/*`, `/tools/image/*`, 11 file tools in `/tools/data/`,
  6 file/download tools in `/tools/social/`, `/tools/design/mockup-generator/`,
  `/tools/security/share-safe-check/`, the two demo routes, the PDF and Image hubs,
  two published articles about PDF tools, and 39 file-topic articles (unpublished).
- **Recoverability:** git tag `archive/file-tools-2026-11-27` (commit fe6dfa10) and
  an offline bundle `D:\Archives\MC-NovaTools\file-tools-2026-11-27.bundle`.
- **Kept shared code:** pdf-lib stays (Invoice Generator uses it). pdfjs-dist is now
  unused by public pages; left in package.json until a separate dependency clean-up.

## D-013 — New lead product: Pre/Post Results Builder for school counselors
- **Evidence:** `docs/research/reset-2026-11-27/` (25 hypotheses scored; H08 72/100,
  H09 71, RLSProof 66). Demand evidence is **structural, not observed**: ASCA's
  results-report templates and RAMP rubric ask counselors for pre/post data; no
  direct counselor complaints were captured (Reddit not fetchable); search volumes unknown.
- **Why it, despite weak evidence:** fits the owner's real expertise, costs little
  to test (static, browser-only, no data stored), has a recurring trigger (every
  lesson unit or group), and no dedicated free tool was found. Treat it as a
  validation bet with stop conditions (growth-experiments.md), not a proven market.
- **Rejected:** RLSProof v2 as lead (strong free alternatives incl. Supabase's own
  advisors); Turkish rehber öğretmen paperwork kit (H09) deferred to a parallel
  low-cost test; sport-psychology and wellbeing apps (regulatory/claims risk,
  Paddle's medical-advice ban, weak differentiation).
- **Guardrails:** descriptive statistics only; no causal, clinical or diagnostic
  claims; no ASCA endorsement implied; answers never leave the tab (enforced by test).

## D-014 — No monetisation and no new paid infrastructure for now
- Supersedes D-009's scope. turkiye-business-feasibility.md: if the owner is a public
  employee, Law 657 art. 28 may bar commercial activity; a Sept 2026 Presidency opinion
  says app and content income should be assessed under it. Paddle is the only checked
  merchant of record that may accept a Türkiye-based seller. Nothing is sold, and
  ads are not added to the new tool (`AdsEligible: false`), until a lawyer and a mali
  müşavir have answered the questions in that file.

## D-015 — Keep the valid cycle-1/2 site-quality work
- Kept: homepage fixed card budget (≤6) and 9,400px height test; guides retirement
  and /ar noindex; duplicate redirects; honest blog cards; consent-gated events.
- Also fixed now (pre-existing defects found while verifying): the build replaced
  every tool page's meta description with generated text ending "route qgq."; the
  tool-page enhancer overwrote buttons' visible names with their ids (WCAG 2.5.3).
