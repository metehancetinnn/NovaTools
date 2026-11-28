# Product strategy — Pre/Post Results Builder for school counselors

Date: 2026-11-28. Replaces the 2026-11-27 "see what a file gives away" strategy,
which the owner rejected (decision D-012). Evidence: `reset-2026-11-27/recommendation.md`,
`reset-2026-11-27/opportunity-scan.csv`, `reset-2026-11-27/turkiye-business-feasibility.md`.
Unknowns are written as unknown.

## 1. Target audience
US K-12 school counselors who run classroom lessons and small groups and must
report their results (ASCA model results reports, RAMP applications, district
reports). Second audience, only after validation: Turkish rehber öğretmenler who
run ön-test / son-test activities (H09/H10).

## 2. Recurring problem
After every lesson unit or group, the counselor turns two sets of survey answers
into averages, percent change and a before/after chart per objective. Today that
is manual Excel, Sheets or Canva work, often with identifiable student data in
cloud files, and easy to get wrong (unmatched students, reversed items, objectives
with no question measuring them).

## 3. Why existing alternatives are insufficient
- Spreadsheet templates (free and $15–40 paid ones) are manual and error-prone.
- General survey tools (Google Forms, Microsoft Forms) chart each survey, not the
  matched before/after change per objective.
- Counseling-management platforms such as Pathful were checked only on their
  pricing page; whether they include pre/post analysis is **unknown** and must be
  checked before further investment.
- No dedicated free pre/post tool for counselors was found (absence in searches is
  not proof that none exists).

## 4. Product and differentiated value
"Paste your pre/post answers and get a correct, report-ready result in five minutes,
without the data leaving your computer." Built and live in this branch:
- paste from Sheets/Excel or open a Forms CSV; student-code matching; warnings for
  name/email/phone columns, unmatched codes, invalid answers, small groups and
  objectives without a question;
- scale (with reverse scoring and a target value), yes/no and right-answer items;
- per-objective chart (PNG/SVG), per-item table (CSV, formula-injection safe),
  descriptive summary paragraph, print view, local project file;
- no account, no storage, no network calls with data (enforced by test).

## 5. Evidence of demand (honest)
Structural only: ASCA templates and rubric require pre/post data; ASCA publishes
graphing how-tos; a small paid spreadsheet market exists. **No direct user complaints
were captured and search volume is unknown.** This is a validation bet.

## 6. Competitor analysis
See `reset-2026-11-27/recommendation.md` §3.1 (table with sources and access dates).

## 7. Acquisition and retention
- Acquisition: one honest guide page by the owner on writing pre/post items;
  counselor communities (Facebook groups, r/schoolcounseling where rules allow,
  ASCA Scene) by asking, not spamming; a free listing on TPT/Pinterest pointing
  to the tool; podcast guest spots. No mass-produced pages.
- Retention: several analyses per term; saved project file; yearly results cycle.

## 8. Monetisation
None during validation (D-014). Possible later, only after legal and tax advice:
paid item/objective packs or a report kit, then a school licence. Revenue is unknown.

## 9. Türkiye legal and tax risk (summary; not legal advice)
- Law 657 art. 28 may bar commercial activity if the owner is a public employee →
  lawyer before any revenue.
- Payments: Stripe, Lemon Squeezy, PayPal unavailable for Türkiye-based sellers;
  Paddle possibly, payout to a Turkish bank unconfirmed.
- Privacy: by design no student data reaches a server, which keeps KVKK/GDPR/FERPA
  exposure low; adding sync or accounts would change this and needs counsel.
- Claims: descriptive statistics only; not diagnostic or clinical; no ASCA endorsement.

## 10. MVP scope and validation plan
MVP: built (above). Validation: `growth-experiments.md` (G-R1..G-R3) with stop
conditions at week 8: under 100 completed analyses, or under 15% of users running a
second analysis within 30 days, or no unprompted mention → stop.

## What the rest of the site is now
Certified calculators, developer tools (RLSProof, GEO inspector) and converters stay
reachable through the category hubs but get no new investment. PDF, image and generic
file tools are retired (410).
