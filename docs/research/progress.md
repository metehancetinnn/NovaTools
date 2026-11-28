# Progress record

Mission: `docs/NOVATOOLS_AUTONOMOUS_MISSION.md`. Decisions: `decision-log.md`.
Branch `feat/share-safe-pivot` (name predates the reset), PR metehancetinnn/NovaTools#289
(open, not merged, not deployed). On resume: read this file, then `git log --oneline main..HEAD`,
then verify the last checkpoint's tests before continuing.

## Reset cycle — 2026-11-27/28 (owner's direction reset)

Owner input: no LPC licence (title: Psychological Counselor and Guidance Teacher,
Türkiye); reject PDF/file utilities and Share-Safe; find a differentiated product.

**Done (decisions D-011..D-015):**
1. LPC removed from 169 source files; real title on author/about pages; regression test. (fe6dfa10)
2. Retired: all `/tools/pdf/*` and `/tools/image/*`, 18 file/download tools elsewhere,
   Share-Safe, two demo routes, the PDF and Image hubs, 2 published + 39 unpublished
   file-topic articles. They answer **410 Gone** via Pages Functions; no homepage
   redirects. Links to them were removed site-wide (whole cards/list items, prose unlinked).
   Archive: tag `archive/file-tools-2026-11-27`, bundle `D:\Archives\MC-NovaTools\file-tools-2026-11-27.bundle`.
3. Research: 25 hypotheses scored, top 4 deep-dived, Türkiye feasibility
   (`reset-2026-11-27/`). Recommendation H08, with weak, structural demand evidence.
4. Built the **Pre/Post Results Builder** (`/tools/education/pre-post-results/`):
   pure core + 60+ assertions in `tests/pre-post-results.mjs`; homepage, nav,
   search, sitemap and certification now lead with it.
5. Pre-existing defects fixed while verifying: tool-page meta descriptions were
   overwritten with "... route qgq." text on every tool page; the enhancer replaced
   buttons' visible names with their ids.
6. Build/test gates that only enforced volume were relaxed with a written reason
   (exactly-100 outline plan, ≥12 category pages); no quality gate was weakened.

**Checks run locally (Windows, 2026-11-28):** `npm test` exit 0; `npm run lint`
0 errors (5 pre-existing warnings); audit:public-routes, lint:site-links,
lint:blog-outlines, lint:blog-routes, lint:rss, audit:adsense, lint:i18n,
lint:critical-css, lint:performance-budget, audit:claim-candidates, audit:client-env,
lint:blog-images, lint:media-dimensions, lint:blog-seed all exit 0. Build: Vite and
every post-build step pass when run one by one; one-shot `npm run build` runs out of
memory on this machine (R-16); `build:csp` fails locally on one hash (R-05/R-17).
Browser (built site): tool runs end to end with the example data at 1280px and
375px, no console errors, only same-origin requests; homepage 8,141px at 375px,
6 cards, no links to retired pages; search finds the tool for "pre post" and "counselor".
**Not run locally:** Playwright e2e, Lighthouse, the 410 Functions on Cloudflare (unit-tested only).

### Acceptance status (reset)
| Item | Status |
|---|---|
| Credential accurate | done |
| Rejected products removed from public site | done in branch; live after merge (verify 410s, R-13) |
| Valid earlier work preserved | done (D-015) |
| ≥20 hypotheses, deep dives, evidence with dates | done; evidence for the winner is structural only |
| Türkiye feasibility | done; lawyer and mali müşavir questions open |
| New direction implemented and tested | MVP done; demand unvalidated |
| CI verified | pending on the pushed head |

### Owner actions
1. Review PR #289 (now the reset PR). Do not merge until CI is green; after deploy,
   curl a retired URL (expect 410) and a kept tool (expect 200).
2. Before any revenue, ads or sales: an administrative-law lawyer on Law 657 art. 28,
   and a mali müşavir on the tax route (questions in turkiye-business-feasibility.md).
3. Run G-R0: ten short conversations with school counselors before more building.
4. Grant Search Console access so search demand stops being "unknown".
5. Set the GitHub repo homepage field to https://mc-novatools.com.

### Next task
G-R0 interviews and a check of Pathful's actual features. Technical next: R-04
(single canonical form per page) and removing the now-unused pdfjs-dist dependency.

## Earlier cycles (superseded where D-011..D-015 conflict)

## Cycle 1 — 2026-11-27 (earlier part of the session)
- a52093c7 Share-Safe File Check; blog narrowed to editorial scope (24 out of
  scope withheld); blog category archives retired; GitHub owner migration
  (`psycholog1sts` → `metehancetinnn`); structured-data honesty fixes.
- 9db3423f Playwright jobs pinned to ubuntu-24.04 (26.04 image has no Chromium).
- b6a9447f raised the homepage height budget 12,900 → 13,150. **Superseded in
  cycle 2:** that was the fourth raise to fit per-tool growth; see D-003.

## Cycle 2 — 2026-11-27
| Commit | Change |
|---|---|
| 6fd4caa1 | Homepage repositioned on the product; fixed six-card shortlist; height test restored to a fixed 9,400 px budget plus a ≤6-card assertion; distinct blog cards; runtime "110+ tools" title removed; badge test sums category counts |
| eff533aa | Share-Safe: PDF text hidden under black boxes / white-out (FEAT-01); OpenAI/Anthropic/Hugging Face key patterns (FEAT-18) |
| 31db94f0 | `/guides/` template cluster and topic map retired with 301s; `/ar/*` noindex; `/about`, `/blog/article-template`, `/blog/<slug>` duplicates 301'd |
| HEAD of cycle 2 (`feat: consent-gated Share-Safe usage events…`) | Dead "Additional routes" block removed from /categories/; consent-gated coarse usage events on Share-Safe; research repository and records |

Research datasets (agents, reviewed): niche-scorecard.csv + niche-scoring-model.md
(18 hypotheses, 11 researched), competitor-matrix.csv, evidence-ledger.csv,
user-problem-map.csv, feature-opportunity-matrix.csv, page-audit.csv (130 rows),
legal-risk-matrix.csv + legal-tax-feasibility.md. Written here: decision-log,
product-strategy, technical-risk-register, growth-experiments, this file.
Agent claims were spot-checked: page-audit P1 items were confirmed against the
built `dist/` and the live site before acting.

### Tests and checks actually run (Windows, Node 24, 2026-11-27)
| Command | Result |
|---|---|
| `npm run lint` | 0 errors, 5 pre-existing warnings |
| `npm test` (full chain incl. `tests/share-safe-check.mjs`) | pass (exit 0) |
| `node tests/share-safe-check.mjs` | pass; new: hidden-text unit cases (full, partial "Name: [box]", white-out, grey box, drift on blank space, page limit), AI key patterns, event-privacy contract |
| `npm run build` | all steps pass except final `build:csp` (known CRLF hash mismatch, R-05; Linux CI authoritative) |
| `audit:public-routes`, `lint:site-links` (59 URLs), `lint:blog-outlines`, `audit:adsense`, `lint:rss`, `lint:performance-budget`, `lint:i18n`, `lint:critical-css`, `audit:claim-candidates`, `audit:client-env` | pass |
| `validate:structured-data` standalone after full build | fails on author-page aliases (pre-existing, R-06); in-build step passes |
| Browser (built site, vite preview) | homepage 8,934 px at 375 px with "Recently used" shown (~8.4k without), 6 cards, badge 27 = sum of category counts, search "gps"/"redact"/"metadata" reach the right tools, search box above the fold at 1440×800; Share-Safe PDF fixture: name and IBAN under black boxes and a white-on-white note found, visible text and page 2 not flagged, re-check after cleaning still lists them |
| Playwright e2e, Lighthouse | not run locally (no Playwright browser); run in PR CI |

## Acceptance criteria status
| # | Criterion | Status |
|---|---|---|
| 1 | Failures investigated with evidence | done (D-001, page-audit.csv, live checks) |
| 2 | Niche selected from documented research | done (D-002) |
| 3 | Original product implemented | done for v1 (Share-Safe + hidden-text verification); next increments listed in product-strategy.md |
| 4 | Core journeys work end to end | verified in the built site for PDF, JPEG, HAR, DOCX (cycle 1) and hidden-text PDF (cycle 2); CI e2e pending |
| 5 | Weak inventory addressed | done for blog scope, guides, duplicates, /ar/, dead links; R-04 alias/sitemap form still open |
| 6 | Legal/tax assessment | done (legal-tax-feasibility.md); professional confirmation required |
| 7 | Research records maintained | done |
| 8 | Tests executed, outcomes recorded | done above; e2e/Lighthouse via CI |
| 9 | GitHub migration and CI verified | migration done (cycle 1); CI must be re-checked on the pushed head |
| 10 | Growth experiments with baseline | defined; baseline is "unknown" until 14 days of events after deploy |

## Owner actions (cannot be done from here)
1. Review and merge PR #289; production deploy happens from `main`. After it
   is live, curl the retired routes (R-07) and request recrawl in Search Console.
2. Confirm whether the "Licensed Professional Counselor / LPC" credential is
   held. If not, it must be removed from ~170 files (D-010).
3. Give Search Console access/exports so the baseline is real.
4. Ask a mali müşavir to request a 20/B özelge before any revenue (D-009).
5. Do not request AdSense review before 3 Dec 2026, and only when G-90-1's
   pre-conditions hold.
6. GitHub repo "homepage" field still shows the old Vercel URL; set it to
   https://mc-novatools.com.

## Next highest-impact task
R-04: emit one canonical form per page (stop the `/x/index.html` and `/ar/`
copies in `post-build-fix.mjs`, extensionless URLs in the sitemap) in its own
PR with route tests; then FEAT-08 batch mode.
