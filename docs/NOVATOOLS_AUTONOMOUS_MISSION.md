# NovaTools — Autonomous Product Research, Rebuild and Growth Mission

> Condensed record of the mission brief the owner pasted into the Claude Code
> session on 2026-11-27. The brief referred to this file, which did not exist
> yet; it is kept here so a resumed session can re-read the rules and
> acceptance criteria. Progress is tracked in `docs/research/progress.md`.

## Mandate
Turn NovaTools into a differentiated, useful, sustainable international product.
Years of AdSense rejections (low-value content, insufficient originality,
undifferentiated products) and near-zero organic traffic are treated as a
product and business-model failure, not an SEO task. The executor may discard
weak features and pages, replace the niche and rebuild parts of the app when
evidence supports it. Execution, not advice: research → decide → implement →
test → review → repeat.

## Operating rules
- Inspect the real repo, history, PRs, CI and deployment state first; prefer D:.
- Preserve uncommitted work; branch; keep recoverable checkpoints; never expose secrets.
- No routine approval requests. Stop only for MFA/CAPTCHA, inaccessible accounts,
  financial charges, binding legal decisions, production-risk or irreversible actions.
- Use parallel agents only for genuinely independent work; verify their output.
- Never fabricate demand, traffic, revenue, rankings, legal eligibility,
  AdSense approval, test results or deployment success.
- Never weaken tests to get green CI. Specifically re-examine the homepage
  height threshold raised from 12,900 to 13,150 px.
- No fake demos, testimonials, authors or credentials; no doorway/scaled pages.
- Do not assume website advertising qualifies for a Turkish tax exemption.

## Phases
1. Establish the truth: full URL/feature inventory with quality assessment
   (retain / improve / merge / redirect / remove / noindex).
2. Continuous external research with sourced, dated, confidence-rated evidence.
3. ≥15 niche hypotheses, ≥7 deep-dived, weighted model, one primary direction
   (+ optional adjacent). Answer: why choose it over alternatives, why return?
4. Product strategy: audience, problem, promise, positioning, retention, outcome.
5. Research repository under `docs/research/`: niche-scorecard.csv,
   competitor-matrix.csv, evidence-ledger.csv, user-problem-map.csv,
   feature-opportunity-matrix.csv, page-audit.csv, legal-risk-matrix.csv,
   technical-risk-register.md, decision-log.md, progress.md,
   product-strategy.md, growth-experiments.md.
6. Turkish legal/tax feasibility (GVK mük. 20/B, KDV, KVKK, GDPR, consumer law);
   separate statute, official interpretation and open questions.
7. Implement the product in the existing repo; every visible control must work.
8. Content and policy remediation: fix, merge, redirect, remove or noindex weak
   inventory without mass-producing pages.
9. Growth: realistic channels, privacy-conscious events, baseline, 30/60/90-day
   experiments with hypotheses, costs and stop conditions.
10. GitHub/CI: verify the username migration and CI; TDD; real test outcomes.
11. Iterate in cycles; update progress, decisions, datasets, commits and tests
    after each; resume from the last verified checkpoint.

## Acceptance criteria
1. Product and content failures investigated with evidence.
2. Defensible niche selected from documented research.
3. A meaningful original product implemented.
4. Core user journeys work end to end.
5. Weak/duplicate/low-value inventory addressed via an evidence-based plan.
6. Legal and tax risk assessment documented.
7. Research datasets, decision records and progress maintained.
8. Relevant tests executed with real outcomes recorded.
9. GitHub migration and CI state verified.
10. Growth strategy with measurable experiments and a baseline.

Priority order: real user value → originality → trust → legal sustainability →
retention and distribution → search visibility and monetization.
