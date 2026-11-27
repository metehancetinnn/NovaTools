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
