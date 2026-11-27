# Product strategy — "See what a file gives away before you send it"

Date: 2026-11-27. Basis: niche-scoring-model.md (D-002), user-problem-map.csv,
competitor-matrix.csv, evidence-ledger.csv. Unknowns are stated as unknown.

## Target users (in priority order)
1. **People who send documents outside their organisation:** paralegals,
   small-firm lawyers, HR and recruiters, freelancers, journalists, public
   records staff. They redact or tidy a PDF/Office file and need to know it is
   actually clean (PROB-01, PROB-02, PROB-03).
2. **Developers and support engineers** attaching HAR files, logs or configs
   to tickets and AI chats (PROB-06, PROB-07, PROB-08).
3. **Anyone posting photos** or route files that carry home location (PROB-04, PROB-09).

## Core problem
Files carry more than the page shows: text under black boxes, earlier PDF
revisions, tracked changes and hidden sheets, GPS and serial numbers, session
tokens. Incidents recur (court and government redaction failures, the 2023
Okta HAR breach, large-scale PDF metadata studies; EV ledger). Existing tools
either remove metadata without checking the result, upload the file, are
CLI-only (x-ray, exiftool), or are desktop features people forget to run.

## Promise
Drop a file; see in plain language what it reveals; download a cleaned copy
that has been **checked again**; be told clearly what could not be removed and
what to do about it. Nothing is uploaded. The product never calls a file "safe".

## Why choose it over established alternatives
- **Verification, not just removal:** the cleaned copy is re-scanned and only
  confirmed removals are reported (competitor-matrix: no observed web tool does this).
- **Redaction check in the browser:** finds text still present under black
  boxes or white-out by rendering each page (FEAT-01; the comparable tool is a
  Python library).
- **One place for the whole "before you send" job:** photo, PDF, Office,
  HAR/log, with honest limits per format.
- **Privacy that can be checked:** no upload; the page makes no network
  requests while processing (verified in the browser, no third-party requests).

## Why return
The trigger recurs: every contract, CV, release, support ticket, photo post.
Retention levers (built or planned): remembered recent tools (built),
task-specific entry points (FEAT-17), batch checks for a folder (FEAT-08),
GPX/route trim (FEAT-11). Return rate is **unknown** until events accumulate
(growth-experiments.md).

## Positioning and information architecture
- Homepage: product promise, primary CTA "Check a file", secondary "Redact a
  PDF", fixed six-card "before you send" toolkit, three task workflows, three
  distinct privacy/PDF articles. The rest of the catalogue stays reachable via
  category hubs and search; it is not the identity.
- Calculators and converters are kept while they are certified and truthful,
  but get no further investment (NICHE-18 "stop investing").

## Measurable user outcome
Share of scans that lead to a cleaned copy whose re-check passes, and share of
PDF scans that surface hidden text which the user then sends through PDF Redact.
Baseline: unknown (no data yet); see growth-experiments.md.

## What it deliberately does not do
- No server processing, accounts or storage of files.
- No AI wrapper: the checks are deterministic and explainable.
- No "safe" verdicts; no claims about legal compliance.
- No mass-produced landing pages; each entry page must have distinct function.

## Next product increments (from feature-opportunity-matrix.csv)
1. FEAT-08 batch mode (folder → summary table → ZIP of cleaned copies).
2. FEAT-17 two genuinely distinct entry pages: "check a redacted PDF" and
   "clean a HAR file for a support ticket", same engine, format-specific defaults.
3. FEAT-11 GPX/TCX trim around start/finish.
4. FEAT-13 rest: off-page text and hidden optional-content layers.
5. FEAT-18 rest: mcp.json / claude_desktop_config.json env blocks.
