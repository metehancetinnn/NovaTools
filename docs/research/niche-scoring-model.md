# Niche scoring model and decision (2026-11-27)

Companion to `niche-scorecard.csv`, `competitor-matrix.csv`, `evidence-ledger.csv`,
`user-problem-map.csv` and `feature-opportunity-matrix.csv` in this folder.

**Ground rules for this pass:** no Search Console, Analytics, keyword-volume or traffic data was
available, so none is used. Wherever a CSV says "unknown", that is literal. The evidence comes from
public pages observed on 2026-11-27 (IDs `EV-xxx`). Many of those pages are vendor pages, and the
ledger marks how much each one can be trusted.

## 1. Criteria and weights

Each criterion is scored 1–5, where 5 is always the favourable end: low cost, low risk, low
competition. The weighted total is Σ(score × weight) / 5, which gives a range of 20–100.

| # | Criterion | Weight | Why this weight |
|---|---|---|---|
| C1 | Identifiable user | 6 | Needed for copy and distribution, but most candidates have one |
| C2 | Painful, recurring problem | 10 | Without pain there is no return visit and no reason to switch |
| C3 | Demand evidence | 10 | Guards against building on assumptions (incidents, studies, requests) |
| C4 | Shortcomings of alternatives | 9 | A reason to choose a newcomer over established tools |
| C5 | Competition / barrier (5 = room to win) | 8 | A solo developer cannot outspend Adobe or Proton |
| C6 | Organic acquisition realism | **12** | The site has near-zero traffic and no budget, so this is the binding constraint |
| C7 | Frequency / retention | 7 | One-off tools reproduce the current problem |
| C8 | Shareability | 5 | Helps with links and word of mouth, but secondary |
| C9 | Monetization / sponsor fit | 8 | AdSense was rejected for "low-value content", so this measures how clearly the page is useful and original |
| C10 | Build + maintenance cost (5 = cheap) | 7 | One developer |
| C11 | Dependency risk (5 = low) | 5 | Browser API changes, wasm libraries, third-party APIs |
| C12 | Legal / privacy exposure (5 = low) | 6 | Excludes health, finance advice, children's data and biometrics. Also penalises probing third-party systems |
| C13 | Demonstrable differentiation | 7 | Can the advantage be shown in a demo rather than claimed? |

The weights sum to 100.

**Sensitivity check:** the ranking was re-run three ways: with equal weights, with demand and
acquisition weighted more heavily, and with the cost and dependency criteria removed. In every run
the same four candidates came top: NICHE-03, -01, -09 and -05. Only their order changed. All four
are "before you share a file" jobs that can run on one engine, so the decision below does not
depend on the exact weights.

## 2. Ranking (all 18 hypotheses)

| Rank | ID | Hypothesis | Total | Confidence | Decision |
|---|---|---|---|---|---|
| 1 | NICHE-03 | PDF redaction verifier | 75.4 | medium | Merge into Share-Safe as lead feature + landing page |
| 2 | NICHE-09 | GPX/FIT route privacy trimmer | 71.4 | medium | Add as a format inside Share-Safe |
| 3 | NICHE-01 | Share-Safe File Check (as built) | 70.4 | medium | **Survives, repositioned** |
| 4 | NICHE-05 | Standalone HAR/log sanitizer | 68.8 | medium | Keep as a Share-Safe section |
| 5 | NICHE-11 | UBL-TR e-Fatura viewer (TR) | 62.0 | low | Watchlist: validate demand first |
| 6 | NICHE-06 | MCP/agent-config secret scan | 60.4 | medium | Fold in as a pattern pack (FEAT-18) |
| 7 | NICHE-04 | AI-upload PII/secret preflight | 57.4 | medium | Defer; later a mode on the same engine |
| 8 | NICHE-14 | Local document compare | 54.0 | low | Reject for now (not researched) |
| 9 | NICHE-12 | Repo-to-prompt packer | 53.4 | medium | Reject |
| 10 | NICHE-02 | Photo EXIF remover only | 52.2 | high | Reject as standalone |
| 11 | NICHE-08 | Local PDF accessibility checker | 52.0 | low | Reject (build size, incumbents) |
| 12 | NICHE-15 | CSV/Turkish-encoding fixer | 51.0 | low | Reject (no evidence) |
| 13 | NICHE-07 | Supabase RLS checker (RLSProof) | 49.8 | medium | Deprioritise |
| 14 | NICHE-10 | Screenshot auto-redaction | 48.6 | low | Reject |
| 15 | NICHE-13 | GitHub Actions linter in browser | 45.0 | low | Reject |
| 16 | NICHE-17 | Browser PDF suite | 42.6 | medium | Reject |
| 17 | NICHE-16 | AI-search/GEO readiness checker | 38.8 | low | Reject (re-confirmed) |
| 18 | NICHE-18 | Status quo calculators portfolio | 37.8 | high | Stop investing |

Eleven candidates had dedicated web research (`deep_dive = yes`). NICHE-13 to NICHE-18 were scored
from earlier knowledge and the repository record only, and their confidence is set to match.

**Caveat on NICHE-09's rank:** it scores well mainly because it is cheap, low-risk and distinctive.
Its organic reach (C6 = 2) and its audience are small. On its own it would not fix the site. As a
format inside the main tool it costs little and supports the same "before you share" identity.

## 3. Selection

### Primary direction: Share-Safe, repositioned as a pre-send document leak check that proves its result

**Does Share-Safe survive?** Yes, but not in its current framing. Positioned as a general
"remove metadata from any file" tool, it competes head-on with Proton, MetaRemover, MetaStrip, a
Google Drive add-on, W3Schools and Adobe (COMP-01…10). That query space is saturated, and some of
those domains are very strong. It survives because the evidence points to a narrower, more painful
and less contested job:

1. **"Did my redaction or edit actually remove the text?"** for PDFs. There is recurring
   high-profile proof that it often does not: EV-003, EV-004, EV-006, EV-007 and EV-008. The best
   detector, Free Law Project's x-ray, is a Python CLI (EV-005), and no browser-local verifier for
   non-technical staff was found.
2. **Hidden content in Office files** that web competitors do not even mention: hidden and
   very-hidden sheets, pivot caches, tracked changes with the deleted text, speaker notes
   (EV-012, EV-014, EV-017).
3. **Proof instead of a claim.** The tool re-scans the cleaned copy (FEAT-02). No observed
   competitor states that it verifies its output.

Photos (EXIF) and HAR/log redaction stay as supporting tabs. They are already built (EV-043), and
they bring in adjacent searches.

### Adjacent expansion (optional, after the redaction verifier)

**FEAT-11: GPX/TCX (later FIT) route privacy trim.** It is the same promise, "what does this file
reveal before I share it", for a group that is easy to identify and that platform privacy zones
leave exposed (EV-031, EV-032). It is cheap, carries low risk and appears to have no online
competitor (COMP-22…24).

### Watchlist, not now

**NICHE-11: browser e-Fatura viewer.** It is the best standalone alternative and has a clear
Turkish audience. The official viewer needs a Java desktop install (EV-034). However, Chrome
removed XSLT in Chrome 158 (EV-035), so a viewer would need a wasm XSLT polyfill, and the demand
data is unknown. Validate it first, for example with a simple page plus Search Console impressions
once that data exists.

## 4. Rejected alternatives and reasons

- **NICHE-02 photo-only EXIF remover:** saturated, free and local on giant domains (EV-040).
  Signal and WhatsApp already strip EXIF from photos sent normally (EV-019).
- **NICHE-04 AI-paste sanitizer as a product:** many browser extensions already do this, some with
  local models (EV-021). Extensions fit the job better than a web page does. The idea is kept as a
  later mode on the same engine (FEAT-10).
- **NICHE-06 MCP secret scanner as a product:** CLI tools already exist (EV-025), and developers
  want this in the CLI or CI. The useful part becomes a cheap pattern pack (FEAT-18).
- **NICHE-07 RLSProof:** Supabase's own advisor now emails project owners (EV-027), and many indie
  scanners launched in 2025–26 (EV-026). Probing other people's databases also carries exposure.
- **NICHE-08 PDF accessibility:** a correct PDF/UA engine is a very large build. The free incumbents
  are trusted (PAC, axesCheck), and making compliance claims creates liability.
- **NICHE-10 screenshot redaction:** crowded extension market (EV-033). OCR in wasm is heavy.
- **NICHE-12 repo-to-prompt and NICHE-13 Actions linter:** established free tools already exist,
  including a browser version of actionlint (EV-036, EV-037).
- **NICHE-14 doc compare and NICHE-15 CSV fixer:** not researched. They are not rejected on their
  merits, but there is no evidence to justify them now.
- **NICHE-16 GEO checker, NICHE-17 PDF suite, NICHE-18 calculators:** these are the commodity or
  hype surface that produced the "low-value content" rejections (EV-044).

## 5. Why would a real person choose this over established alternatives, and why return?

**Why choose it (for the user groups in `user-problem-map.csv`):**
- *The paralegal or records officer* (PROB-01, PROB-02): Acrobat's Redact feature works when it is
  used correctly. Nothing, however, checks the file that is actually about to be sent, and x-ray
  needs Python. A page that shows "these 14 words are still under your boxes" without uploading a
  confidential filing answers a question nobody else answers in a browser.
- *The consultant sending a workbook* (PROB-03): Document Inspector exists only inside desktop
  Office, and only for people who remember to run it. Web cleaners mention only properties.
  Share-Safe lists the hidden sheet by name.
- *The privacy-conscious sender* (PROB-10): competitors claim local processing. Share-Safe re-scans
  its own output, and with FEAT-16 it would let users prove the claim themselves by switching
  Wi-Fi off.
- *The support engineer* (PROB-06): Cloudflare's HAR sanitizer repository was archived on
  2026-06-22 (EV-010), so a maintained client-side alternative has an opening.

**Why return:**
- The trigger repeats. Every outgoing contract, filing, workbook, HAR request or shared track is a
  new occasion, unlike age or BMI calculators.
- With FEAT-08 batch mode and FEAT-09 check reports, it becomes the last step in a routine.
  FEAT-16 (PWA with Share Target) puts it in the phone's share sheet.
- **Honest limit:** return depends on people remembering the tool exists. No retention data exists
  yet, and C7 is scored 3, not 5.

## 6. Top feature opportunities (from `feature-opportunity-matrix.csv`, by impact ÷ effort with judgment)

1. **FEAT-01:** PDF redaction verifier (impact 5, effort 3). This is the differentiator and the
   news hook.
2. **FEAT-08:** batch / folder check with summary and ZIP (4/2).
3. **FEAT-17:** task-specific entry pages on one engine (4/2). These must not be doorway pages.
4. **FEAT-13:** PDF hidden-text checks: invisible text, off-page text, hidden layers (4/3).
5. **FEAT-18:** LLM-provider and MCP-config secret patterns (3/1).

After those come FEAT-09 (check report), FEAT-11 (GPX trim), FEAT-16 (offline PWA and Share
Target) and FEAT-10 (AI-paste mode). FEAT-19 (server processing) and FEAT-20 (cloud LLM detection)
are rejected because both break the local-only promise.

## 7. Distribution channels where these users already are

1. **Legal and records community, through the redaction verifier.** The places are legal-tech blogs
   and newsletters that already cover redaction failures (the EV-006 Volokh series), the paralegal
   and law-practice communities, and the Free Law Project ecosystem. Offering a browser companion to
   x-ray and crediting it fits there. Pitch each new public redaction failure with a reproducible
   check, not with marketing.
2. **Privacy tool directories and communities.** These include the Privacy Guides data-redaction
   tool list and forum (EV-020), AlternativeTo (where MetaRemover is listed, EV-013) and privacy
   subreddits. What earns attention there is an open-source engine plus the re-scan proof.
3. **Developer and support channels.** Publish `share-safe-core.mjs` as an open-source library on
   GitHub and npm, then post a Show HN about the HAR and redaction checks. Generic metadata tools
   drew almost no HN engagement (EV-015), so lead with the redaction and HAR angles. Also add a
   "how to send us a HAR safely" link in vendor support documentation, now that Cloudflare's tool is
   archived.

Secondary: running and cycling forums and clubs for FEAT-11, and Turkish KVKK and legal-office
audiences for Turkish-language pages. No reach figures are known for any of these channels.

## 8. Biggest uncertainties

- **Search demand is unknown.** No volume data exists. The long-tail queries ("check redacted pdf",
  "hidden sheets excel before sending", "sanitize har file") are plausible but unmeasured.
  Search Console impressions after launch are the first real signal.
- **Willingness to visit a website.** Professionals may rely on Acrobat or Document Inspector, and
  developers prefer CLIs. The page has to win on "check the file I'm about to send", not on
  cleaning.
- **Detection completeness and liability.** A missed leak could be blamed on the tool. Copy must
  never say "safe". It should say "these known locations were checked; this remains".
- **Competitors may add depth.** MetaRemover, MetaStrip or Proton could add revision, redaction or
  verification features quickly. The moat is execution and trust, not technology.
- **AdSense outcome.** One original tool does not outweigh the commodity pages that are still
  indexed. Approval is not predictable from this research.
- **The evidence is partly vendor-sourced** (see the confidence column in the ledger). Competitor
  claims about local processing were not tested.
