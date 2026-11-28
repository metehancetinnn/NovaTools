# Growth experiments

## Reset 2026-11-28: experiments for the Pre/Post Results Builder

The Share-Safe experiments below (G-30-1 .. G-90-1) are **cancelled**: the product
was retired (D-012). No traffic, Search Console or revenue data was available; the
numbers below are decision thresholds, not forecasts.

**Measurement:** consent-gated, count-only events on the tool: `tool_success{mode=analyze}`
(an analysis was built) and `result_download{output_format=png|svg|csv}`. No answers,
codes, questions or titles are recorded. Counts are lower bounds (consenting visitors only).

### G-R0 Problem interviews before more building (week 0)
- **Action:** 10 short conversations or DMs with US school counselors (communities that
  allow it): "How did you make your last pre/post graph, and how long did it take?"
  Ask about Pathful or other tools they already use.
- **Stop:** fewer than 4 of 10 call it a recurring chore → stop investing in H08.

### G-R1 Community launch (weeks 1–8)
- **Action:** one honest post per community where self-promotion rules allow; offer the
  tool free with the guide section on writing pre/post items. No paid ads, no vote
  manipulation, no automated comments.
- **Measure:** completed analyses per week; share of users with a second analysis within
  30 days; unprompted mentions or shares.
- **Stop (week 8):** under 100 completed analyses, or under 15% second-analysis rate,
  or zero unprompted mentions → stop H08.

### G-R2 Turkish mock-up test in parallel (near-zero cost)
- **Action:** share a one-page Turkish mock-up of the ön-test/son-test version (H09/H10)
  in 2–3 rehber öğretmen groups; count genuine requests. Do not use school data.
- **Decision:** clearly stronger pull than G-R1 (for example more than 30 genuine requests)
  → build the Turkish version next.

### G-R3 Paid test (only after D-014's legal questions are answered)
- **Action:** a $15 "results report kit" waitlist or pre-order.
- **Stop:** fewer than 10 pre-orders or 50 waitlist sign-ups from at least 300 tool users.

---

## Archived (cancelled 2026-11-28): Share-Safe experiments

Date: 2026-11-27. No traffic, Search Console or revenue data was available to
this work; nothing below assumes any. Numbers marked "target" are decision
thresholds, not forecasts.

## Measurement
- **Events (consent-gated, coarse; D-008):** `page_view` (existing GA4),
  Share-Safe `tool_success{mode=scan}` (activation), `tool_success{mode=clean,
  success}` (task completion; success = re-check passed), `result_download`.
- **Not measured:** file names, contents, findings text. Visitors without
  analytics consent are invisible, so use ratios, not totals (R-10).
- **Search:** Google Search Console impressions/clicks for the Share-Safe and
  PDF Redact URLs (owner must grant access or export; currently unavailable).

## Baseline
| Metric | Value | Source |
|---|---|---|
| Organic clicks/month | unknown | Search Console not accessible here |
| Share-Safe scans/week | 0 (events did not exist before this change) | new event |
| Scan → clean rate | unknown | first 14 days after deploy |
| Clean → download rate | unknown | first 14 days after deploy |
| Referring domains to the tool | unknown | Search Console "Links" |

The first 14 days after the merge are the baseline window. No experiment
below is evaluated before it closes.

## Experiments

### G-30-1 Community launch to privacy and records audiences (days 1–30)
- **Hypothesis:** people who already discuss redaction failures and metadata
  leaks will use a browser tool that proves a redaction failed.
- **Action:** one honest post each on Privacy Guides forum, AlternativeTo
  listing, and one relevant subreddit following its self-promotion rules;
  open-source the core (`share-safe-core.mjs`) under the repo licence with a
  README. No paid promotion, no vote manipulation, no automated comments.
- **Measure:** scans/week, scan→clean rate, referring domains.
- **Target to continue:** ≥30 scans/week by day 30. **Stop:** <5/week, or any
  community flags it as spam.
- **Cost:** ~6 hours.

### G-30-2 Show HN / developer channel for the HAR and key scan (days 1–30)
- **Hypothesis:** developers attaching HAR files to support tickets will use a
  local sanitizer, especially since Cloudflare archived its HAR sanitizer repo
  (EV ledger, 2026-06-22).
- **Action:** Show HN post linking the tool and the open core; offer vendors a
  link for their "how to send a HAR file" support docs (ask, do not spam).
- **Measure:** HAR/JSON share of scans (`output_format=json`), backlinks.
- **Stop:** no measurable uptick within 14 days of the post.

### G-60-1 Task-specific entry pages (days 31–60)
- **Hypothesis:** "check a redacted PDF" and "clean a HAR file for support" are
  how people describe the job; distinct pages with format-specific defaults
  earn impressions the generic page does not (FEAT-17).
- **Action:** two pages only, each with distinct function defaults, examples
  and fixtures; no keyword variants.
- **Measure:** Search Console impressions per page after 30 days.
- **Stop:** either page under 100 impressions after 30 days → merge back.

### G-60-2 Batch mode (days 31–60)
- **Hypothesis:** checking a folder makes the tool part of a recurring
  release/sending routine (FEAT-08).
- **Measure:** share of sessions with more than one scan; repeat visits.
- **Stop:** under 5% of scan sessions use batch after 30 days → keep but stop investing.

### G-90-1 AdSense re-review readiness (days 61–90)
- **Hypothesis:** with the duplicate/template inventory de-indexed and an
  original product leading, the site is a stronger candidate.
- **Pre-conditions:** merge deployed and verified; Search Console shows the
  retired URLs dropping; tax özelge requested (D-009); certified CMP in place.
- **Action:** one review request, not before 3 Dec 2026 and only when the
  pre-conditions hold. Approval is not predictable; no promise is made.
- **Stop:** if rejected again, do not resubmit until the cause is understood.
