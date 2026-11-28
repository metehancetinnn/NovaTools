# Reset research: opportunity scan and recommendation (2026-11-27)

Companion file: `opportunity-scan.csv` in this folder, with 25 hypotheses (H01–H25).
Earlier research in `docs/research/` covered the rejected file-safety direction. I reused its
method (explicit weights, "unknown" means unknown, every claim has a URL) but none of its ideas.

**Ground rules.** No Search Console, keyword-volume or traffic data was available, so every search
volume in this pass is **unknown**. All URLs were accessed on **2026-11-27**. Reddit could not be
fetched directly in this session (old.reddit.com was refused). Reddit material therefore appears
only through Supabase's own community mirror. **I captured no first-hand complaints from US school
counsellors on Reddit**, and that is the biggest gap in the evidence (see §6).

---

## 0. Read this first: a legal issue that affects every direction

If the owner is a **state-employed teacher (devlet memuru)**, Article 28 of Law 657 forbids
activities that would make him a merchant (tacir/esnaf), forbids partnerships in commercial
companies, and requires such activities to be reported. On 2026-09-02 an opinion from the
Presidency General Secretariat, sent to YÖK, said that income from **content creation, app
development and YouTube-type platforms** should be assessed under Article 28
([24saatgazetesi, 2026-09-02](https://www.24saatgazetesi.com/cumhurbaskanligindan-devlet-memurlarina-icerik-ureticiligi-uyarisi-resmi-gorus-yoke-iletildi)).
Book royalties have historically been allowed ([memurlar.net](https://www.memurlar.net/haber/381724/)).
Whether software sales, AdSense or a school licence count as allowed royalties or as forbidden
trade is **not settled by any source I found**.

**This needs professional advice (an idare hukuku lawyer plus a mali müşavir) before any
monetisation. That includes AdSense on the current site.** It does not apply if the owner works at
a private school or is not a civil servant. Until it is resolved, every plan below assumes a
**free, non-monetised validation phase**.

---

## 1. Scoring rubric

Each criterion is scored 1–5, where 5 is always the favourable end. Score = Σ(score × weight) / 5,
which gives a range of 20–100.

| Criterion | Weight | Why |
|---|---|---|
| Demand evidence (observed, not assumed) | 20 | Guards against building on assumptions |
| Organic acquisition realism *for this founder* | 20 | Zero traffic and zero budget make this the binding constraint |
| Weakness of alternatives / room to differentiate | 15 | A newcomer needs a reason to be chosen |
| Retention / recurrence | 10 | The owner asked for repeat usage |
| Monetisation realism | 10 | Kept moderate on purpose: §0 may cap it anyway |
| Founder fit (expertise, credibility, network) | 10 | Considered, but not allowed to dominate |
| MVP feasibility in 1–3 weeks | 5 | Most candidates pass |
| Legal / regulatory simplicity | 10 | No clinical claims, no regulated services, no minors' health data |

**Hard gates, applied before scoring:** anything the owner rejected (file converters and
processors, generic file-safety tools, thin AI wrappers, generic utilities with strong free
alternatives) and anything needing treatment or diagnosis claims or regulated professional
services gets REJECT, whatever its score.

**Sensitivity check.** Doubling the monetisation weight puts H08 clearly ahead of H09. Doubling
acquisition makes them roughly equal (H09 gains because the owner is an insider). H01 stays third
in both cases because of competitor saturation. The top three are the same under all three
weightings, so the decision does not hinge on the exact weights.

## 2. Ranking (top of `opportunity-scan.csv`)

| Rank | ID | Hypothesis | Score | Verdict |
|---|---|---|---|---|
| 1 | H08 | Browser-only pre/post results builder for school counsellor lessons and groups | **72** | **Recommend (validate first)** |
| 2 | H09 | Türkiye rehber öğretmen yearly workflow kit (plan → log → reports), browser-only | 71 | Runner-up, validated in parallel |
| 3 | H01 | RLSProof v2: Supabase policy simulator + generated tests | 66 | Keep as a side asset, no major investment |
| 4 | H10 | TR ön-test/son-test evaluator | 66 | Merge into H08 as its Turkish version |
| 5 | H25 | Supabase RLS regression gate for CI | 61 | Fold into H01 |
| 6–9 | H06, H07, H14, H15 | MCP auditor / US use-of-time tracker / coach routine builder / athlete readiness | 55 each | Watchlist or reject |
| … | 16 more | see CSV | 39–54 | Reject |

---

## 3. Deep dives

### 3.1 H08: pre/post results builder for school counsellors (US first, Turkish later)

**The job.** ASCA's school-counselling model asks counsellors to show results for classroom
lessons and small groups. The ASCA *Small-Group Plan and Data Report* and *Lesson Plan and Data
Report* templates contain pre/post-assessment sections and graph placeholders
([small-group template](https://schoolcounselor.org/getmedia/a0716805-dbed-435c-b271-465ee0b95487/5-small-group-plan-CC-TEMPLATE.dotx),
[lesson template](https://schoolcounselor.org/getmedia/96aff4bc-22c5-41aa-a550-41c52e854311/4-lesson-plan-Template-CC-TEMPLATE.dotx),
[Classroom and Group Results Report](https://www.schoolcounselor.org/getmedia/4d96f4b2-d1cd-4b82-ab7b-01ec42fa2e86/Classroom-and-Group-Results-Report.docx)).
The RAMP rubric checks that each learning objective aligns with at least one pre/post item
([2025 rubric](https://schoolcounselor.org/Recognition/RAMP/2025-Scoring-Rubric-(1))). ASCA
publishes a separate *Graph Development Tips* guide for Excel, Sheets and Canva
([PDF, last modified 2025-10-20](https://www.schoolcounselor.org/getmedia/53830698-d47a-42d0-82d7-056c15414025/Graph-Development-Tips.pdf)).
That ASCA needs a how-to suggests the step is not trivial, but this is an inference.

**Audience size (observed).** The national student-to-counsellor ratio was about 371:1 in 2024-25
([K-12 Dive](https://www.k12dive.com/news/more-students-have-access-to-school-counselors/812609/)).
I did not find a total headcount in the sources I opened, so the number of counsellors is
**unknown** here.

**Signs of pain (indirect):**
- A podcast describes counsellors who do not know where to begin with data: *"you don't really know where to start."* ([School Counseling Simplified ep. 75, 2022-01-25](https://schoolcounselingsimplified.libsyn.com/website/75-data-collection-without-tears))
- On the data burden: *"No other educator role is being tracked like this."* ([School for School Counselors, 2025-07-28](https://www.podpage.com/school-for-school-counselors-podcast/graded-use-of-time-data))
- On data as advocacy: *"A concrete number is a fact."* ([ASCA Newsletter, May 2026](https://www.schoolcounselor.org/Newsletters/May-2026/Is-Collecting-Use-of-Time-Data-Really-a-Good-Use-o?st=CT))
- Small willingness to pay: counsellors buy spreadsheet tools, such as a use-of-time tracker at
  $15, reduced from $20 ([The Responsive Counselor](https://theresponsivecounselor.com/product/school-counselor-use-of-time-tracker-and-analysis-tool/)),
  and a $40 tracker bundle ([Counselor Keri](https://shop.counselorkeri.com/products/school-counseling-forms-and-templates-counselor-time-tracker-referral-more), from search listing only).

**Alternatives and their gaps**

| Alternative | Price (observed) | What it does | Gap for this job |
|---|---|---|---|
| ASCA templates + Graph Tips | Free (templates); RAMP fee $250/$500 | Word templates; manual graphing guidance | Fully manual; done again for every lesson or group |
| Excel / Google Sheets / Forms | Free | Anything, by hand | Formula errors; reverse-scored items and matched pairs are handled by hand; student data sits in cloud files |
| [Pathful for counsellors](https://counselors.pathful.com/pricing) | Free forever; Pro $4/mo (annual); district licence | Time tracking, ASCA domain reporting, trend reports, forms, AI credits | No pre/post results analyser is listed on its pricing page (pricing page only, so it may exist elsewhere: **verify**) |
| [ASCA MApp](https://apps.apple.com/us/app/id1519820019) | Free, members only | RAMP companion | Last updated 2023-09-13; no ratings |
| TPT/Payhip spreadsheets | $15–40 | Mainly use-of-time | Not pre/post focused (no dedicated pre/post tool found in searches) |

**Differentiation that can be shown in a demo, not just claimed:**
1. **Nothing leaves the browser.** No upload, no account. The project is saved as a local file.
   Student data stays on the counsellor's machine, which is a real FERPA-comfort argument compared
   with pasting into cloud tools. The site's existing privacy-first engine and consent-gated
   analytics support this.
2. **A measurement check, not just charts.** The tool shows which objective has no item,
   reverse-scores negatively worded Likert items, and reports matched and unmatched pre/post
   counts. The owner's psychometrics background is credible here.
3. **Output that drops into the counsellor's report.** A side-by-side grouped bar chart (PNG/SVG),
   a per-item table and a plain-language summary built from a fixed template, not AI.

**Retention.** Every lesson unit and small group produces a new pre/post set, plus an annual
results report or RAMP cycle. The RAMP timeline expects analysed data reports and graphs around
Aug–Sep ([timeline](https://www.schoolcounselor.org/getmedia/b3aa30e7-d3b7-446f-941f-cbcf84a58e8d/fifth-edition-ramp-application-timeline.pdf)).

**Acquisition (realistic).** A free TPT/Pinterest listing that links to the tool (a common
counsellor discovery path, though not measured here), posts in counsellor Facebook groups and
r/schoolcounseling where their rules allow, guest spots on counsellor podcasts, and an English
page for "pre post test graph for school counselors". **The search volume for that query is
unknown.** The weakness is that the owner is not inside the US network.

**Monetisation (only after §0 is resolved).** A free core, plus paid item/objective packs or a
"results report kit" at $10–20, matching the observed $15–40 range. A school or district licence
comes later. AdSense fits a page of original professional guidance better than the old calculator
portfolio did, but that is a judgement, not a measurement.

**Kill reasons.** Counsellors say "Sheets is fine". Pathful or ASCA adds the same feature for free.
Outreach from Türkiye does not reach US counsellors.

### 3.2 H09: Türkiye rehber öğretmen yearly workflow kit

**The job.** The rehber öğretmen prepares the school guidance programme in the first week of
October through the e-Rehberlik system and sends it to RAM
([Eurydice](https://eurydice.eacea.ec.europa.eu/tr/eurypedia/turkiye/rehberlik-hizmetlerinden-sorumlu-egitim-personeli)).
They also produce committee minutes, end-of-term and end-of-year activity reports, and
interview/observation forms every year.

**Demand signals.** Sorubak lists separate 2025-2026 end-of-year guidance report files for each
grade, plus committee minutes
([example](https://www.sorubak.com/20252026-8-sinif-yil-sonu-rehberlik-faaliyet-raporu_241864.htm)).
Rehber Panda runs a free form generator for eight guidance forms and a free document pool
([form generator](https://rehberpanda.com/araclar/form-uretici/), [pool](https://rehberpanda.com/rehber-ogretmen/)).
Workload is in the news: counsellors are assigned to second schools, and the union chair says
*"Sorunu çözmek yerine iki okula yaymaktır."*
([24saatgazetesi, 2026-11-12](https://www.24saatgazetesi.com/rehberlik-hizmetlerinde-ikinci-okul-tartismasi-ogrencinin-ihtiyaci-takvime-sigmiyor)).
The national headcount and search volumes are **unknown**. The 18,561 schools without a counsellor
figure is contested ([Milliyet, via search](https://www.milliyet.com.tr/gundem/sorunun-cozumu-kaynaginda-7378220)).

**Gaps in the alternatives.** MEBBİS/e-Rehberlik is mandatory, but it is a data-entry system, not
a writing aid. Sorubak and Rehber Panda provide static documents that are edited by hand every
year, and Rehber Panda's page does not say how form data is handled.

**Why it is not first.** Monetisation is the weakest of the top three. Rehber Panda positions
itself explicitly as free, and the Turkish teacher market expects free tools. Reports and forms
can contain special-category data (health, family) under KVKK Art. 6. Selling to MEB colleagues
makes the §0 risk most visible. Its big advantage is distribution: the owner can put it in front
of real counsellors this week. That is why it is validated in parallel at near-zero cost, and why
H10 (the Turkish ön-test/son-test) is planned as the Turkish face of H08.

### 3.3 H01/H25: Supabase security (RLSProof)

**Demand is real and growing:**
- UpGuard found **16,326** Supabase databases with publicly readable tables; **55.8%** held
  personal data. It names tables created through the API, which coding agents use, as not getting
  RLS by default ([UpGuard, 2026-09-23](https://www.upguard.com/blog/everything-everywhere-systemic-data-exposure-in-supabase-apps);
  [TechCrunch, 2026-09-25](https://techcrunch.com/2026/09/25/some-supabase-customers-are-publicly-exposing-reams-of-peoples-data-to-the-web/)).
- The Crissyfield study of 159,041 Lovable projects found 24,664 that sent database records on
  page load ([report](https://www.crissyfield.de/research/lovable-en/)). Its HN thread got 1,011
  points and 387 comments ([HN, 2026-11-14](https://news.ycombinator.com/item?id=50499017)).
- Developer complaints:
  - *"The supabase Row Level Security method must be in top10 worst product decisions ever."* ([HN, 2026-09-27](https://news.ycombinator.com/item?id=49867066))
  - *"Always seemed like a minefield to me."* ([HN, 2026-11-15](https://news.ycombinator.com/item?id=50507155))
  - *"So it mostly gets skipped, and a missed policy ships as a data leak."* ([r/Supabase via Supabase mirror, reply dated 2026-06-22](https://supabase.com/contribute/t/860-66969-11493-reddit_post_1ucizps))
  - Coding agents *"tend to write Supabase code that works but quietly skips the security parts"* ([Supabase GitHub discussion, about Nov 2026](https://github.com/orgs/supabase/discussions/53311))

**But the supply side is saturated:**

| Competitor | Price | Approach | Limitation |
|---|---|---|---|
| [Supabase Security Advisor](https://supabase.com/docs/guides/database/database-advisors) | Free, first-party | Lints including `0013_rls_disabled_in_public` and `0024_permissive_rls_policy` | Pattern-based; does not evaluate the logic of a condition |
| [Supabase RLS Tester](https://supabase.com/changelog/45233-feature-preview-rls-tester) | Free, preview (2026-04-24) | Runs a query as a logged-out or logged-in role and shows the policies evaluated | SELECT only |
| [Psychevus RLS simulator](https://psychevus.com/tools/supabase-rls) | Free | Browser-only; paste a schema; simulates anonymous, new user and owner per table | Same pitch as RLSProof; it already exists |
| [supashield](https://github.com/Rodrigotari1/supashield) | MIT, 104 stars | CLI with `--as-user`, snapshots/diffs, pgTap export | CLI only |
| rlsautotest, rlsgate, rls-guard, supa-sniffer, supabase-audit | OSS | Test generation, CI gates | Low traction ([HN list](https://hn.algolia.com/api/v1/search?query=supabase%20rls&tags=story)) |
| [Vibe App Scanner](https://vibeappscanner.com/pricing) | Go $29/mo, Pro $49/mo | External scans, monitoring | The pricing page does not mention RLS |

At least ten "Show HN" RLS tools appeared in 2025-2026. Most got under 10 points, and the best got
30. The problem has attention, but the *tools* do not get traction, and the first-party platform
is closing the gap. **Verdict: keep RLSProof live as a credible developer asset. Do not make it
the new identity.** The only differentiated work left (generated pgTAP plus a CI gate, H25) is
already covered by OSS.

### 3.4 Sport psychology and coaching (H14, H15, H17)

- **Coach-facing routine builder (H14, score 55).** The closest competitor, Toughness Trainer,
  sells a coaches' course at $29.99 and has **3 ratings**, last updated 2025-12-05
  ([App Store](https://apps.apple.com/us/app/-/id1587002977)). I found no complaint threads.
  Demand evidence is thin, and thin competition here is not proof of demand.
- **Athlete readiness check-ins (H15, 55).** Free tiers and cheap apps exist: CrewLAB has a free
  team tier (from search), and Readiness is a paid app with CSV export
  ([App Store](https://apps.apple.com/us/app/id1437719482)). AthleteMonitoring is quote-only
  ([pricing](https://www.athletemonitoring.com/pricing)). Daily wellness data from often-minor
  athletes is health data under GDPR/KVKK. **Reject.**
- **Consumer mental-training apps (H17, 46).** The market is saturated: Restoic $7.99/mo, among
  others ([App Store](https://apps.apple.com/qa/app/restoic-performance-mindset/id1557936632)).
  **Reject.**

The owner's sport-psychology background is real, but no evidence I found turns it into a
better opportunity than H08 or H09.

---

## 4. Recommendation: H08, a privacy-first results builder for school counsellors

- **Audience:** US K-12 school counsellors who run classroom lessons and small groups and must
  report results (ASCA model, RAMP applicants, district results reports). The Turkish version
  (rehber öğretmen ön-test/son-test, H10) follows only if validation passes.
- **Recurring problem:** after each lesson unit or group, the counsellor turns pre/post answers
  into averages, percent change and side-by-side graphs that match the objectives. This is done
  by hand in Excel, Sheets or Canva, often with identifiable student data in cloud files.
- **Why alternatives fall short:** templates and spreadsheets are manual and error-prone.
  Pathful's free tier covers time tracking, not (per its pricing page) pre/post analysis. The
  ASCA app has been stale since 2023. I found no dedicated pre/post tool for counsellors, but
  absence from my searches is not proof that none exists.
- **Product and value:** "Paste your pre/post answers and get a correct, report-ready result in
  five minutes, without the data leaving your computer."
- **Demand evidence:** structural (ASCA templates and rubric require it; ASCA publishes graph
  how-tos) plus indirect (podcasts, $15–40 paid spreadsheet market). **No direct user complaints
  were captured. Treat demand as a hypothesis to test, not a fact.**
- **Competitors:** see the table in §3.1.
- **Acquisition:** free TPT/Pinterest listing → tool; counsellor groups and subreddits; podcast
  guesting; one strong English guide page written from the owner's own counselling practice
  (original, not mass-produced).
- **Retention:** multiple analyses per term; a saved local project file; an annual report cycle.
- **Monetisation:** none during validation. Afterwards, and only once §0 is cleared: paid
  item/objective packs or a report kit ($10–20), then a school licence. Treat any revenue
  projection as **unknown**.

**Legal and regulatory risks (flag for professional advice):**
1. **657 Art. 28** (see §0). This is the main risk, and it comes before any revenue.
2. **FERPA / student privacy.** Keep processing local. Never transmit or store responses, and tell
   users to use student codes, not names. If a server feature is ever added (sync, accounts),
   schools will ask for a data-privacy agreement and **US education-privacy counsel is needed**.
   COPPA does not apply as long as students never use the tool directly. Keep it counsellor-only.
3. **Trademarks and copyright.** Use "ASCA"/"RAMP" only descriptively ("helps with the
   pre/post section of results reports"). Never imply endorsement, and do not copy ASCA template
   text or layouts.
4. **Claims.** Describe what the tool computes, not effectiveness ("shows change in responses"
   rather than "proves your programme works"). Make no clinical or mental-health claims.
5. **Selling digital goods to the US from Türkiye.** Use a merchant-of-record provider if
   monetised. A Turkish mali müşavir is needed for income declaration (and §0).

## 5. MVP (1–3 weeks) and validation plan

**MVP: what the first version does**
- Paste from Sheets/Forms or import a CSV of pre and post responses keyed by student code. A
  column-name check warns if a column looks like names or emails.
- Item setup: map each item to an objective and a type (Likert 1–5 / yes-no / knowledge), with a
  reverse-score toggle. A warning appears when an objective has no item, mirroring the rubric's
  alignment check.
- Results: per-item and overall pre/post means, percent agreeing or correct, percent change, and
  matched/unmatched counts.
- Output: a grouped bar chart (PNG/SVG), a per-item table, a templated plain-language summary
  paragraph, and a print-friendly one-page summary.
- Local-only: save and reopen the project as a JSON file; no account; no network calls with
  data. This reuses the site's existing privacy-first browser architecture.
- One original guide page by the owner: how to write pre/post items that match objectives.
- **Out of scope:** accounts, storage, AI generation, district dashboards, use-of-time tracking
  (Pathful covers it), and the Turkish version (until validation).

**Validation (8 weeks, free, after a 1–2 week build):**
- Week 0, before building: 10 short conversations or DMs with US counsellors (Facebook groups,
  r/schoolcounseling where rules allow, ASCA Scene) asking how they made their last pre/post
  graph and how long it took. **Stop before building** if fewer than 4 of 10 describe this as a
  recurring chore.
- In parallel, at near-zero cost: share a Turkish one-page H09/H10 mock-up in 2–3 rehber öğretmen
  groups and count replies and requests.
- After launch, track with the existing consent-gated, count-only events: analyses completed,
  returning users (a second analysis within 30 days), and chart exports.
- **Stop or pivot conditions at week 8 of active outreach:** under 100 completed analyses, *or*
  under 15% of users running a second analysis within 30 days, *or* zero unprompted
  shares/mentions. Then stop H08. If the Turkish test produced clearly stronger pull (for example
  more than 30 genuine requests), pivot to H09/H10. Otherwise do not start another product
  without new evidence.
- **Paid test, only after §0 is cleared:** a $15 "results report kit" pre-order or waitlist. Fewer
  than 10 pre-orders or 50 waitlist sign-ups from at least 300 tool users means do not build
  paid features.

## 6. Weakest points of this evidence

1. **No direct US counsellor complaints were captured.** Reddit was not fetchable, so H08's demand
   rests on structural requirements (templates, rubric) and podcasts. It might be a chore people
   tolerate rather than a pain they pay to remove.
2. **Every search volume is unknown.** Neither "pre post graph school counselor" nor Turkish
   rehberlik queries were measured.
3. **Pathful was checked only on its pricing page.** It may already offer pre/post analysis
   elsewhere in the product. Check this before building.
4. **US distribution from Türkiye is unproven.** H09 has the better channel but the worse
   monetisation.
5. **§0 (657/28) could cap monetisation for every option.** Its applicability to software and ads
   is unresolved.
6. Several numbers come from vendor or researcher self-reports (UpGuard, Crissyfield, scanner
   pricing pages) and are marked as such.

## 7. Sources (all accessed 2026-11-27)

- UpGuard, systemic Supabase exposure (2026-09-23): https://www.upguard.com/blog/everything-everywhere-systemic-data-exposure-in-supabase-apps
- TechCrunch (2026-09-25): https://techcrunch.com/2026/09/25/some-supabase-customers-are-publicly-exposing-reams-of-peoples-data-to-the-web/
- Crissyfield Lovable research: https://www.crissyfield.de/research/lovable-en/ ; HN thread https://news.ycombinator.com/item?id=50499017
- HN comments: https://news.ycombinator.com/item?id=49867066 ; https://news.ycombinator.com/item?id=50507155
- HN Supabase RLS story search: https://hn.algolia.com/api/v1/search?query=supabase%20rls&tags=story
- Supabase Database Advisors docs: https://supabase.com/docs/guides/database/database-advisors
- Supabase RLS Tester preview (2026-04-24): https://supabase.com/changelog/45233-feature-preview-rls-tester
- rlsautotest post (Supabase mirror of r/Supabase): https://supabase.com/contribute/t/860-66969-11493-reddit_post_1ucizps
- vibe-shield discussion: https://github.com/orgs/supabase/discussions/53311
- Psychevus RLS simulator: https://psychevus.com/tools/supabase-rls
- supashield: https://github.com/Rodrigotari1/supashield
- Vibe App Scanner pricing: https://vibeappscanner.com/pricing
- NVD CVE-2025-48757: https://nvd.nist.gov/vuln/detail/CVE-2025-48757
- Firewreck 2.0: https://mrbruh.com/firewreck2
- ASCA small-group template: https://schoolcounselor.org/getmedia/a0716805-dbed-435c-b271-465ee0b95487/5-small-group-plan-CC-TEMPLATE.dotx
- ASCA lesson template: https://schoolcounselor.org/getmedia/96aff4bc-22c5-41aa-a550-41c52e854311/4-lesson-plan-Template-CC-TEMPLATE.dotx
- ASCA Classroom and Group Results Report: https://www.schoolcounselor.org/getmedia/4d96f4b2-d1cd-4b82-ab7b-01ec42fa2e86/Classroom-and-Group-Results-Report.docx
- ASCA Graph Development Tips: https://www.schoolcounselor.org/getmedia/53830698-d47a-42d0-82d7-056c15414025/Graph-Development-Tips.pdf
- ASCA RAMP 2025 rubric: https://schoolcounselor.org/Recognition/RAMP/2025-Scoring-Rubric-(1)
- ASCA RAMP fifth-edition timeline: https://www.schoolcounselor.org/getmedia/b3aa30e7-d3b7-446f-941f-cbcf84a58e8d/fifth-edition-ramp-application-timeline.pdf
- ASCA Newsletter May 2026: https://www.schoolcounselor.org/Newsletters/May-2026/Is-Collecting-Use-of-Time-Data-Really-a-Good-Use-o?st=CT
- K-12 Dive ratios: https://www.k12dive.com/news/more-students-have-access-to-school-counselors/812609/
- Pathful pricing: https://counselors.pathful.com/pricing
- ASCA MApp: https://apps.apple.com/us/app/id1519820019
- Responsive Counselor tracker: https://theresponsivecounselor.com/product/school-counselor-use-of-time-tracker-and-analysis-tool/
- Counselor Keri bundle (search listing): https://shop.counselorkeri.com/products/school-counseling-forms-and-templates-counselor-time-tracker-referral-more
- School Counseling Simplified ep. 75: https://schoolcounselingsimplified.libsyn.com/website/75-data-collection-without-tears
- School for School Counselors, use-of-time: https://www.podpage.com/school-for-school-counselors-podcast/graded-use-of-time-data
- Eurydice Türkiye: https://eurydice.eacea.ec.europa.eu/tr/eurypedia/turkiye/rehberlik-hizmetlerinden-sorumlu-egitim-personeli
- Sorubak 2025-2026 report example: https://www.sorubak.com/20252026-8-sinif-yil-sonu-rehberlik-faaliyet-raporu_241864.htm
- Rehber Panda: https://rehberpanda.com/araclar/form-uretici/ ; https://rehberpanda.com/rehber-ogretmen/
- 24saatgazetesi, second-school assignments (2026-11-12): https://www.24saatgazetesi.com/rehberlik-hizmetlerinde-ikinci-okul-tartismasi-ogrencinin-ihtiyaci-takvime-sigmiyor
- 24saatgazetesi, Presidency opinion on civil servants' content/app income (2026-09-02): https://www.24saatgazetesi.com/cumhurbaskanligindan-devlet-memurlarina-icerik-ureticiligi-uyarisi-resmi-gorus-yoke-iletildi
- memurlar.net on royalties: https://www.memurlar.net/haber/381724/
- Toughness Trainer: https://apps.apple.com/us/app/-/id1587002977
- Readiness app: https://apps.apple.com/us/app/id1437719482
- AthleteMonitoring pricing: https://www.athletemonitoring.com/pricing
- Restoic: https://apps.apple.com/qa/app/restoic-performance-mindset/id1557936632
- Ahrefs llms.txt study: https://ahrefs.com/blog/llmstxt-study/
- EAA exemptions (Taylor Wessing): https://www.taylorwessing.com/en/interface/2025/accessibility/key-eu-accessibility-act-exemptions-and-the-challenges-they-pose
- Ticaret Bakanlığı influencer guide: https://ticaret.gov.tr/haberler/ticaret-bakanligi-sosyal-medya-etkileyicileri-icin-kilavuz-yayimladi
