# Running a small international software product from Türkiye: feasibility notes

> **This is not legal, tax or financial advice.** It is desk research from public sources,
> done on 2026-11-27. Nothing here is a legal conclusion. Every "needs advice" item must go
> to a mali müşavir (SMMM/YMM) and, for employment, privacy and health-regulation questions,
> a lawyer. Do not assume any exemption applies until you have an özelge (VUK md. 413) in
> your own name or written professional advice.
>
> This file **extends** `docs/research/legal-tax-feasibility.md` and
> `docs/research/legal-risk-matrix.csv` (LEGAL-01..28, written for ad income). It does not
> repeat them. It covers selling a paid software product (SaaS or subscription). Where it
> corrects them, it says so.

**Status labels used below**

- **[V] Verified:** read in the primary source (statute text on mevzuat.gov.tr, the provider's
  own documentation, or EU legal text) on the date given.
- **[U] Unverified:** commonly reported (law-firm notes, news, forums, secondary tax sites)
  but not confirmed in a primary source.
- **[A] Needs advice:** depends on facts or on how the administration interprets the law.
  A mali müşavir or lawyer has to decide.

**Profile assumed:** one individual, tax-resident in Türkiye, currently employed as a
guidance teacher (psikolojik danışman / rehber öğretmen). Whether the employer is a
**public school (Devlet memuru, 657)** or a **private school (İş Kanunu employee)** is
**unknown**. That one fact changes the whole answer (section 1.1).

---

## 0. Corrections and additions to the earlier notes

| Earlier note | Correction or addition | Status |
|---|---|---|
| LEGAL-12 (Bağ-Kur likely triggered) | 5510 md. 53 sets a priority rule. Someone who is 4/c (memur) and also 4/a or 4/b is insured **first under 4/c**. Someone who is 4/a and 4/b at the same time is insured **under 4/a**. So for an employed teacher, Bağ-Kur is probably not the *primary* status. SGK practice (whether a 4/b record still opens, and whether optional premiums apply) is still open. | [V] statute, [A] application |
| LEGAL-10 (paid features probably ticari kazanç) | Two routes were not considered: **GVK md. 18** (copyright income of a *bilgisayar programcısı* from publishing, selling or renting software online) and **GVK md. 89/13** (an 80% deduction of profit from software services rendered to non-residents and used exclusively abroad). Section 1.3 covers both. | [V] statute, [A] applicability |
| LEGAL-14/15 (Stripe, Lemon Squeezy) | Stripe's MoR successor, **Stripe Managed Payments**, is also not available to Türkiye-based businesses. Its supported business locations are CA, US, 31 European countries, AU, HK, JP and SG. | [V] |
| LEGAL-16 (Paddle) | Paddle's Acceptable Use Policy (updated 13 Apr 2026) **prohibits "medical advice"** products and human services not tied to software (coaching is named). This matters for psychology products. | [V] |
| LEGAL-25 (cayma hakkı) | For subscriptions, **6502 md. 52** also applies. A fixed-term subscription may not auto-renew for the same term without the consumer's request or approval. Indefinite subscriptions, or those longer than a year, can be cancelled at any time without penalty. Cancellation can never be harder than sign-up. | [V] |
| (new) | **657 md. 28** and the penalty in **657 md. 125/D-h** are quoted in section 1.1. | [V] |

---

## 1. Legal and tax route for selling software subscriptions abroad

### 1.1 Gate zero: what kind of employee you are (the most decision-relevant item)

**[V] 657 sayılı Devlet Memurları Kanunu md. 28** (mevzuat.gov.tr consolidated text,
retrieved 2026-11-27):

- Memurs may not do any activity that would make them a **tacir** or **esnaf** under the
  Turkish Commercial Code (TTK). They may not work in commercial or industrial
  establishments. They may not be a commercial representative or agent, a partner in a
  *kollektif şirket*, or a *komandite* partner in a *komandit şirket*.
- They may not **open an office, büro or similar place** for professional or freelance
  activity. They may not work in any workplace belonging to private persons or private legal
  entities.
- Narrow exceptions: board roles in their own cooperatives, professional bodies and
  statutory aid funds, plus "duties specified in special laws".

**[V] 657 md. 125/D-h:** "Ticaret yapmak veya Devlet memurlarına yasaklanan diğer kazanç
getirici faaliyetlerde bulunmak" is punished with **kademe ilerlemesinin durdurulması**. That
is the second-heaviest disciplinary penalty.

What this means for the routes below:

| Route | If a public-school memur | If a private-school employee |
|---|---|---|
| Şahıs işletmesi (ticari kazanç, tacir/esnaf) | **Appears directly barred by md. 28** [A] | Generally possible. Check the employment contract for non-compete, side-work or IP clauses [A] |
| Teknopark (needs an office in the zone) | Barred twice: tacir status and "no office" [A] | Possible in principle (section 1.4) |
| GVK 18 copyright income (no business) | **[U]** Commonly said to be compatible with md. 28 because an author is not a tacir. Not verified for selling SaaS subscriptions [A] | Possible [A] |
| GVK 20/B content/online services | **[U]** Some commentators say a memur can use it because it does not create tacir status. No primary confirmation. Software sold outside app stores is excluded anyway (LEGAL-10) | Possible where in scope |
| Shareholder (not manager) of a Ltd/A.Ş. that does the selling | **[U]** Commonly reported as permitted, because md. 28 lists only kollektif and komandite partnerships. Being *müdür* or a board member is reported as not allowed [A] | Possible |

Also: **657 md. 31** (no disclosure of confidential public-service information) and the KVKK
rules in section 3 mean **no student data, case notes or school materials from the day job**
may go into the product, its training data or its marketing. **[V]** md. 31 text;
application **[A]**.

**Action:** confirm employment status first. A public-school memur should get a lawyer's
written view, and possibly ask the employing directorate (İl/İlçe MEM), *before* taking any
revenue.

### 1.2 Şahıs işletmesi (sole proprietorship): the default route

- **[V]** Outside any exemption, income from selling software or SaaS as a business is
  *ticari kazanç* (GVK md. 37). That means mükellefiyet (registration), bookkeeping, an
  annual return and the progressive tariff (2026 brackets per Tebliğ 332; see LEGAL-02/05).
- **[V] Genç girişimci (GVK mük. 20):** already covered in LEGAL-13. It applies only under
  age 29 and on first registration, covers income tax only and not KDV, and the return is
  still filed.
- **[A]** Whether a sole proprietorship is compatible with your employment: see 1.1.

### 1.3 Exemption and deduction routes relevant to software (none can be assumed)

**(a) GVK mükerrer 20/B: covered in LEGAL-01..04, 10.** Summary for software: Tebliğ 325
Örnek 19-20 covers only **mobile apps sold through app-store platforms**. Computer
applications sold directly to customers are **excluded**. A web SaaS sold through Paddle
therefore looks **out of scope** unless an özelge says otherwise. **[V]** text, **[A]**
for your product.

**(b) GVK md. 18: serbest meslek (copyright) exemption. [V] statute text:**
- It exempts the proceeds that authors, including a "**bilgisayar programcısı**", earn by
  publishing works such as "**bilgisayar yazılımı**" in "bilgisayar ve internet ortamı", or
  by selling, assigning or **renting** their rights in them.
- Occasional (*arızi*) earning does not block the exemption.
- The exemption does not cover tax withheld under GVK 94. When a Turkish payer pays, it may
  still have to withhold.
- **Limit:** anyone whose total income under this article exceeds the amount in the 4th
  tariff bracket (2026: 5,300,000 TL, per LEGAL-02) cannot use it.
- **[U]/[A] Key uncertainty:** commonly reported GİB practice is that the exemption covers
  the author personally exploiting a work, not activity carried out through a *ticari
  organizasyon*. Whether a recurring SaaS subscription counts as "renting rights in software"
  or as a commercial *service* is unclear. This needs an özelge. It may be the only route
  plausibly open to a memur. That makes the özelge especially important.

**(c) GVK md. 89/13: an 80% deduction for software services exported. [V] statute text** (as
amended by 7491, 27/12/2023):
- Who can use it: businesses providing services, including **yazılım** (software), *veri
  işleme* (data processing) and *veri saklama* (data storage), to persons resident or based
  abroad, where the service is rendered in Türkiye and **used exclusively abroad**.
- What it gives: **80%** of the profit from those activities can be deducted from the
  income-tax base.
- Conditions: the whole profit must be transferred to Türkiye by the annual return deadline,
  and the invoice must be issued **in the foreign customer's name**. The President can change
  the rate (0-100%).
- It is a deduction for a registered business, so it presupposes the şahıs işletmesi route.
- **[A]** If you sell through a MoR, your customer is the MoR (for example Paddle.com Market
  Ltd, UK). Does selling through it satisfy "used exclusively abroad" when some end buyers
  are in Türkiye? Unknown.

**(d) KDV export-of-services exemption: KDVK md. 11/1-a and 12/2. [V] statute text.**
- 11/1-a exempts "yurt dışındaki müşteriler için yapılan hizmetler".
- 12/2: the customer must have its residence, workplace or legal or business seat abroad,
  **and** the service must be **used abroad** ("Hizmetten yurt dışında faydalanılmalıdır").
- KDVK md. 6/b: a service counts as performed in Türkiye if it is performed **or used** in
  Türkiye.
- **[A]** With a MoR the invoice goes to a foreign reseller, but whether the benefit is
  "used abroad" when the reseller sells on to Turkish buyers is not settled (LEGAL-07).
  **[U]** Secondary reports of özelgeler on app-store developers suggest the part sold to
  Turkish end users may not qualify. Get an özelge, or at least a mali müşavir's written
  position.

**(e) Teknopark: 4691 sayılı Kanun. [V] statute text** (consolidated version dated 02/01/2026):
- Who it covers: a "Girişimci" is any real **or** legal person using the zone. Individuals
  are not excluded by definition.
- Geçici md. 2: profit from software, design and R&D carried out **exclusively in the
  zone** is exempt from income and corporate tax **until 31/12/2028**. There are extra
  conditions for revenue from intangible rights.
- **[U]** In practice you need admission by the zone's management company, an approved
  project, physical premises in the zone (with limited remote-work allowances), and separate
  accounting. Costs and admission criteria vary by zone.
- **[A]** For a memur this is very likely incompatible with md. 28 (office plus commercial
  activity). For a private employee it is feasible but heavy for a solo side project.

### 1.4 Other Türkiye-side items carried over (not repeated)

- FX conversion rules: LEGAL-20.
- ETBİS: LEGAL-26.
- Özelge: LEGAL-28.
- **[V] Bağ-Kur:** see the correction in section 0.

---

## 2. Payments: which platforms work for a seller based in Türkiye (checked 2026-11-27)

| Platform | Status for a Türkiye-based seller | Evidence | Status |
|---|---|---|---|
| **Paddle** (MoR) | Türkiye is **not** on Paddle's unsupported-seller list. Individuals and sole traders do identity verification only, with no business verification. Payout is by bank/wire transfer in 13 currencies including USD and EUR. **TRY is not supported**; your bank converts. Whether it pays out to Turkish banks was **not confirmed** (Paddle points to sellers@paddle.com). **The AUP prohibits "medical advice" and coaching-type human services.** | paddle.com/help: sanctions page (no date shown); identity verification; local-currency payouts; AUP "Last Updated 13 April 2026" | [V] listing, [U] actual onboarding and payout |
| **Lemon Squeezy** | Shutting down on 31 Mar 2027; no new sign-ups. | lemonsqueezy.com/blog/2026-update (28 Jan 2026) | [V] |
| **Stripe** (direct) | Türkiye is not a supported country, including preview countries. | stripe.com/global | [V] |
| **Stripe Managed Payments** (MoR) | Business must be in CA, US, 31 European countries, AU, HK, JP or SG. **Türkiye not included.** It also excludes professional services and anything involving human intervention. | docs.stripe.com/payments/managed-payments/eligibility | [V] |
| **Gumroad** | Gumroad's help pages would not render (JavaScript only). Whether it pays out to Türkiye, by bank or PayPal, is **unconfirmed**. Since PayPal does not operate in Türkiye, a PayPal payout is not a fallback. | gumroad.com/help (not readable) | [U] |
| **PayPal** | PayPal stopped operating in Türkiye in 2016 after BDDK refused its licence. PayPal's Turkish FAQ reportedly says Turkish customers cannot send, receive or withdraw. paypal.com/tr returned HTTP 403, so it could not be read directly. | TechCrunch 31 May 2016; search summary of paypal.com/tr | [U] (strong) |
| **iyzico** | Turkish licensed payment institution. Multi-currency card acceptance (USD, EUR, GBP and others) is advertised. Its help centre says the name on the uploaded **vergi levhası** must match the payout account, which implies tax registration. It is **not a MoR**, so foreign VAT/sales tax would be **your** responsibility. | iyzico.com help centre (documents page returned 404) | [U] details, [A] fit |
| **Payoneer** | Widely used from Türkiye (secondary sources). On Payoneer's own pages, Türkiye is not in the same-currency local-withdrawal list, and receiving accounts cannot be used for domestic payments in Türkiye. It is a payout or collection rail, **not a MoR**. | payoneer.com pricing and receiving-accounts pages (search summaries) | [U] |
| **Wise** | Wise's help article lists **Türkiye** among countries where **USD account details are not available**. TRY account details stopped for Türkiye addresses on 31 Mar 2023. Whether a Türkiye resident can open a Wise Business account at all is not confirmed. | wise.com/help/articles/2810318 (no date shown) | [V] USD restriction, [U] rest |
| **GitHub Sponsors** (donations only) | Türkiye is a supported region (LEGAL-17). Not a way to sell a product. | docs.github.com | [V] |

**What a MoR does and does not do**

- **[V]** Paddle's Buyer Terms (updated 31 Mar 2026): Paddle acts as an **authorised
  reseller**. EU/UK and rest-of-world buyers contract with Paddle.com Market Ltd (England and
  Wales). Paddle, not you, is the seller to the end customer.
- **[V]** Abroad, Paddle collects customer-facing VAT, GST and sales tax. Without a MoR, a
  non-EU seller of electronically supplied services to EU consumers would have to register
  for EU VAT itself (non-Union OSS). **[U]:** this is standard EU VAT practice, but the OSS
  text was not re-read this session.
- **[A] What still has to be declared in Türkiye:** your income from Paddle's payouts, under
  whichever regime applies (ticari kazanç, GVK 18, or 20/B if in scope). Also your KDV
  position on the supply to Paddle (11/1-a or not), invoicing to Paddle (e-Arşiv or a
  hizmet ihracı invoice), FX conversion rules, and Bağ-Kur. A MoR removes **foreign**
  consumer-tax work. It does **not** remove Turkish income tax, bookkeeping or KDV
  questions.

**Practical consequence:** Paddle is the only MoR checked that is plausibly open to a
Türkiye-based individual. It is unconfirmed until Paddle confirms payout to a Turkish bank
in writing, and it is closed to anything that reads as medical advice.

---

## 3. Privacy: KVKK and GDPR

### 3.1 KVKK (6698), as amended by 7499 (in force 01/06/2024)

- **[V] VERBİS:** covered in LEGAL-22. Kurul decision 2025/1572 exempts controllers with
  fewer than 50 employees and a balance sheet under 100M TL, **unless their main activity is
  special-category data**, where the thresholds are much stricter. **A product whose core is
  psychological or health data may lose the exemption.** **[A]**
- **[V] Aydınlatma (md. 10):** an information notice is required at the point of
  collection. Penalty (md. 18/1-a): 5,000-100,000 TL as written in the statute. **[U]** The
  amounts are revalued every year; 2026 figures were not checked.
- **[V] Açık rıza:** needed where no other md. 5 ground applies (for example, non-essential
  cookies or marketing). Do not use consent as a blanket basis for running the contract.
- **[V] Special categories (md. 6, as amended 2024):** the list includes **health** data
  ("sağlığı"), biometric and genetic data, and others. Processing is **prohibited** unless one
  of seven grounds applies. For a private software company the realistic grounds are
  **explicit consent** (md. 6/3-a) or a specific law. The health ground (md. 6/3-e) is
  limited to persons under a duty of confidentiality, or authorised bodies, for health
  services. A software vendor is not that. The Kurul's "adequate measures" are also
  mandatory (md. 6/4).
- **[V] Transfers abroad (md. 9, rewritten 2024):**
  1. An **adequacy decision**. **[U]** No country adequacy decision was found as of this
     date.
  2. Otherwise, **appropriate safeguards**. For a small business in practice this means the
     **KVKK standard contract**: four templates on kvkk.gov.tr, used **unaltered**, and
     **notified to the Kurul within 5 business days** of signing (md. 9/5).
  3. Failing to notify carries a fine of **50,000-1,000,000 TL** (md. 18/1-d, statutory
     base).
  4. Only if neither is possible: **occasional** transfers on narrow grounds, such as
     explicit consent after being told the risks, or necessity for a contract with the data
     subject (md. 9/6).
- **[A] Cloud hosting abroad (Cloudflare, Supabase, Vercel, Paddle):** each is a transfer.
  Cloudflare's public DPA relies on EU SCCs and the Data Privacy Framework. **No
  KVKK-specific standard contract from Cloudflare was found** [U]. Supabase was not checked.
  Most US vendors will not sign a bespoke KVKK contract for a small customer. A lawyer must
  decide whether md. 9/6-b (contract necessity, "arızi" only) can carry continuous hosting.
  Commonly reported view: it cannot, because the transfer is not occasional **[U]**.
  **Minimising what is stored** (client-side processing, as NovaTools already does) is the
  strongest mitigation.

### 3.2 GDPR when serving EU users

All items below are **[V]** in the primary text (Regulation (EU) 2016/679). The EUR-Lex
page did not render this session; the cited articles are well established, but re-check
them before relying on them.

- **Art. 3(2):** GDPR applies to a controller outside the EU that **offers goods or
  services** to people in the EU (paid or free) or **monitors their behaviour**. Selling
  subscriptions to EU customers puts you in scope.
- **Art. 27:** such a controller must **designate an EU representative in writing**. The
  exemption (Art. 27(2)) applies only to processing that is **occasional**, **does not
  include large-scale special-category data** (Art. 9) or criminal data, and is unlikely to
  create risk. A continuous SaaS is hard to call "occasional" **[A]**. A product handling
  psychological data almost certainly cannot use the exemption **[A]**. Representative
  services charge a fee **[U]**.
- **Art. 9:** health data needs an Art. 9(2) condition. For a consumer app this is usually
  **explicit consent**. **Art. 35:** a DPIA is likely if special-category data is processed
  at scale.
- **Art. 8 (children):** for information-society services offered directly to a child on
  the basis of consent, parental consent is needed under 16. Member states can lower this to
  13. UK GDPR has its own equivalent rules.

### 3.3 Strong warning: health, psychological, children's or students' data

If the product records **mood, symptoms, assessments, test scores of psychological scales,
counselling notes, or anything about named students or minors**, then:

1. It is special-category data under KVKK md. 6 and GDPR Art. 9. Explicit consent and extra
   measures are required, the VERBİS exemption may be lost, and the GDPR Art. 27 exemption
   is lost. **[V]** text, **[A]** application.
2. Transfers abroad of special-category data are much harder to justify (KVKK md. 9 plus
   the "ek önlemler" in the standard contract). **[V]/[A]**
3. **US:** non-HIPAA health apps are reportedly covered by the **FTC Health Breach
   Notification Rule** (amended 2024). Washington's **My Health My Data Act** covers
   "consumer health data". **COPPA** applies to children under 13 (amended Rule, compliance
   date reported as 22 Apr 2026). All **[U]**.
4. **EU AI Act Art. 5(1)(f)** prohibits **emotion-recognition AI in workplaces and education
   institutions** (except medical or safety uses), in force since 2 Feb 2025. AI in education
   that evaluates learners is listed as **high-risk** (Annex III). **[U]** on the current
   application dates, which may be postponed by the 2025-26 "digital omnibus"; check before
   building anything AI-based for schools or students.
5. **Using school or student data from your employment is off-limits** (657 md. 31 if
   public, KVKK, and the school's own controller role).

**Low-risk design:** process in the browser, store nothing server-side, no accounts for
minors, no free-text "how do you feel" logs, and no scoring of named people.

---

## 4. Consumer protection for digital subscriptions

**Türkiye ([V] statute text unless marked)**

- **6502 md. 48 and the Mesafeli Sözleşmeler Yönetmeliği:**
  - Pre-contract information is required, including your identity, the total price with
    taxes, and how to cancel.
  - md. 15/1-ğ: no withdrawal right for services performed instantly online or intangible
    goods delivered instantly. **The consumer must be told this before the contract**
    (md. 5/1-h), per LEGAL-25.
- **6502 md. 52 (abonelik):**
  - A copy of the contract must be given on paper or a durable medium.
  - Fixed-term subscriptions may **not** contain clauses renewing them for the same term.
    They can be extended only on the consumer's request or approval before expiry.
  - Indefinite subscriptions, and fixed-term ones over a year, can be **terminated at any
    time, without reason or penalty**. Notice by durable medium is enough.
  - **Cancellation cannot be harder than sign-up.**
  - Remaining prepaid fees must be refunded **within 15 days** of termination taking effect.
    No charge may be made after the regulatory deadline for ending the subscription.
- **[A]** If Paddle is the MoR, Paddle is the seller to the consumer and carries most of
  these duties. Your own Terms must still be consistent with them, and 6563 identity
  disclosure (LEGAL-26) still applies to your site.

**EU**

- **Consumer Rights Directive 2011/83/EU:** consumers get a 14-day withdrawal right for
  distance contracts.
  - For **digital content** not on a tangible medium, the right is lost only if the consumer
    gave prior express consent to immediate performance, acknowledged losing the right, and
    the trader confirmed it on a durable medium (Art. 16(m), as amended by 2019/2161).
  - For **digital services** such as SaaS, the consumer who asks for an early start owes a
    proportionate amount if they withdraw (Art. 14(3)).
  - **[V]** the directive exists; **[U]** exact current wording was not re-read this
    session.
- **Withdrawal button (Directive (EU) 2023/2673, new CRD Art. 11a):** online traders,
  including non-EU traders targeting EU consumers, must offer a two-step "withdraw from
  contract" function. Reported as applying **from 19 June 2026**, with transposition lagging
  in some member states. **[U]**
- **[V] Paddle Buyer Terms (31 Mar 2026):**
  - 14-day withdrawal "for any reason", lost if the buyer agreed to immediate access and
    started using the product.
  - Subscriptions can be cancelled at any time, effective at the end of the billing period.
  - With Paddle as MoR, the checkout and refund mechanics are Paddle's. **[A]** Confirm that
    Paddle's checkout implements the EU withdrawal function.

**Minimum the product must have** (a checklist, not legal sign-off):

1. Terms of Service with your real identity and contact (6563), plus a refund and
   cancellation section consistent with the MoR's buyer terms.
2. A pre-checkout notice: price incl. taxes, renewal period, the no-withdrawal or
   proportionate-payment rule with an explicit consent checkbox, and a link to cancel.
3. One-click or same-channel cancellation, no harder than sign-up, plus a confirmation email
   (durable medium).
4. No silent renewal of fixed-term plans for Turkish consumers. Prefer monthly or annual
   plans that are clearly indefinite and cancellable, with a reminder before annual
   renewal. **[A]**
5. A privacy notice (KVKK aydınlatma plus a GDPR notice) and a cookie banner as already
   planned (LEGAL-21/24).
6. If any health-adjacent feature exists: a clear "not medical advice, not a substitute for
   a professional, crisis lines" notice (see section 5).

---

## 5. Professional-regulation risk for psychology, self-help or sport-psychology software

**Türkiye**

- **[V] 1219 sayılı Kanun ek md. 13** defines **klinik psikolog** as a *sağlık meslek
  mensubu* with specific graduate training.
  - Clinical psychologists may do psychological assessment, and psychotherapy for conditions
    **not defined as illness**.
  - For **illnesses**, psychotherapy is allowed only on a specialist physician's diagnosis
    and referral.
  - In plain terms, **diagnosing or treating mental illness is a regulated health service**,
    tied to physicians and licensed health professionals.
- **[V] 1219** also penalises unauthorised practice of medicine and use of medical titles
  (the "tabip unvanını takınan" provisions). **[A]** Whether software claims could ever reach
  this is a lawyer question, but the direction is clear.
- **[U]** There is no general "psikolog" profession law. A PDR graduate working as a school
  counsellor is a *psikolojik danışman*, not a *sağlık meslek mensubu*, and is commonly said
  not to be entitled to the title "psikolog" or "klinik psikolog". **[U]** There is no
  separately licensed "spor psikoloğu" title.
- **[U]** Health claims in advertising are policed by the Reklam Kurulu (Ministry of Trade)
  and, for products presented with health claims, by TİTCK rules. Their reach to software is
  untested **[A]**.

**EU**

- **MDR 2017/745 Art. 2(1):** software intended for diagnosis, prevention, monitoring,
  prediction, prognosis, treatment or alleviation of disease **is a medical device**. The
  CE-marking regime is heavy, and Rule 11 usually puts it in class IIa or higher.
  MDCG 2019-11 rev.1 (June 2025) is the qualification guidance. Intended purpose is judged
  from your **claims, labelling and marketing**. **[V]** that the guidance exists; **[U]**
  its mental-health specifics were not read.
- **EU AI Act:** see 3.3(4). Emotion recognition in education is banned.

**US**

- **[U]** The FDA reissued its **General Wellness** guidance on 6 Jan 2026. Low-risk products
  promoting wellness (stress management, relaxation, sleep, general fitness), *without*
  reference to a disease, are generally outside device oversight. Disease claims bring them
  in.
- **[U]** State licensing laws protect the practice and title of "psychologist", and often
  "counseling" or "therapy".

**Wording guide** (plain terms; a lawyer should review final copy)

| Generally lower-risk (wellness/education) | Crosses into regulated territory |
|---|---|
| "learn about", "practise", "reflect", "build a routine", "focus and concentration exercises", "pre-competition routine planner", "journaling prompts", "psychoeducation" | "diagnose", "screen for depression/ADHD/anxiety disorder", "treat", "therapy", "cure", "clinically proven" (without trials), "replaces a psychologist", "risk score for [illness]" |
| "for general wellbeing; not a medical device; not a substitute for professional help" | Personalised clinical recommendations, symptom-based triage, medication or treatment suggestions |
| Educational content written and signed in your real role ("school counsellor") | Using "psikolog", "klinik psikolog", "therapist" or "spor psikoloğu" as a title you do not legally hold |
| Self-assessment framed as reflection, with no clinical cut-offs | Publishing validated clinical scales with cut-off scores and "you may have X" output |

Commercial knock-on: Paddle's AUP bans "medical advice" products **[V]**, so health-claim
wording could also lose you your only payment rail.

---

## 6. Summary table

| Requirement | Status | Source | Date |
|---|---|---|---|
| Memurs may not do tacir/esnaf activity or open an office; penalty is kademe durdurma | Verified (text); application needs advice | 657 md. 28, 125/D-h (mevzuat.gov.tr/mevzuatmetin/1.5.657.pdf) | retrieved 2026-11-27 |
| Employment status (public vs private) determines viable route | Needs advice | — | — |
| Memur may hold Ltd/A.Ş. shares (not manage) | Unverified | secondary commentary | — |
| 20/B excludes non-app-store computer applications | Verified (text); product fit needs advice | Tebliğ 325 Örnek 20 (LEGAL-10) | 2024-09-26 |
| GVK 18 exempts a programmer's software publish/sell/rent proceeds up to the 4th bracket (5.3M TL in 2026) | Verified (text); SaaS fit needs advice | GVK md. 18 (1.4.193.pdf) | retrieved 2026-11-27 |
| GVK 89/13: 80% deduction for software services used exclusively abroad; profit repatriated; invoice to foreign customer | Verified (text); MoR fit needs advice | GVK md. 89/13 as amended by 7491 | retrieved 2026-11-27 |
| KDV 11/1-a export exemption needs a foreign customer **and** use abroad | Verified (text); MoR fit needs advice | KDVK md. 11/1-a, 12/2, 6/b (1.5.3065.pdf) | retrieved 2026-11-27 |
| Teknopark income exemption until 31/12/2028; individuals can be girişimci | Verified (text); practical admission unverified | 4691 md. 3/f, geçici md. 2 | consolidated 2026-01-02 |
| 4/c or 4/a takes priority over 4/b (Bağ-Kur) | Verified (text); SGK practice needs advice | 5510 md. 53 | retrieved 2026-11-27 |
| Paddle: Türkiye not on unsupported list; individuals need ID verification only | Verified | paddle.com/help | retrieved 2026-11-27 |
| Paddle payout to a Turkish bank (USD/EUR; no TRY) | Unverified | paddle.com/help payouts | retrieved 2026-11-27 |
| Paddle AUP bans "medical advice" and coaching human services | Verified | paddle.com/help AUP | updated 2026-04-13 |
| Paddle is reseller/seller of record; 14-day EU/UK withdrawal unless used immediately | Verified | paddle.com/legal/buyer-terms | updated 2026-03-31 |
| Stripe and Stripe Managed Payments do not support Türkiye-based businesses | Verified | stripe.com/global; docs.stripe.com/.../eligibility | retrieved 2026-11-27 |
| Lemon Squeezy closing, no sign-ups | Verified | lemonsqueezy.com/blog/2026-update | 2026-01-28 |
| PayPal not operating in Türkiye since 2016 | Unverified (strong) | TechCrunch; paypal.com/tr (403) | 2016-05-31 |
| Gumroad payouts to Türkiye | Unverified | gumroad.com/help (not readable) | — |
| Wise: no USD account details for Türkiye | Verified | wise.com/help/articles/2810318 | no date shown |
| Payoneer / iyzico usable but not MoR | Unverified | provider pages (partial) | — |
| VERBİS exemption for small controllers, unless special-category is the main activity | Verified (via LEGAL-22) | KVKK Kurul 2025/1572 | 2025-10-01 |
| Special-category data: prohibited unless explicit consent or law; extra measures | Verified | KVKK md. 6 (1.5.6698.pdf) | retrieved 2026-11-27 |
| Transfers abroad: adequacy, KVKK standard contract notified within 5 business days, or occasional exceptions | Verified | KVKK md. 9, 18/1-d | retrieved 2026-11-27 |
| No country adequacy decision issued | Unverified | search of kvkk.gov.tr | 2026-11-27 |
| Cloudflare/Supabase provide a KVKK standard contract | Unverified (none found) | cloudflare.com/dpa | 2026-11-27 |
| GDPR applies (Art. 3(2)); EU representative (Art. 27) unless occasional and no large-scale special-category data | Verified (primary text, not re-fetched); applicability needs advice | Regulation 2016/679 | — |
| TR subscriptions: no same-term auto-renewal; cancel anytime; refund within 15 days; cancellation no harder than sign-up | Verified | 6502 md. 52 | retrieved 2026-11-27 |
| TR: no withdrawal for instant digital services if disclosed in advance | Verified | MSY md. 15/1-ğ, 5/1-h (LEGAL-25) | — |
| EU withdrawal button from 19 Jun 2026 | Unverified | Directive 2023/2673 (law-firm notes) | 2026 |
| Diagnosing/treating mental illness is a regulated health service (clinical psychologist, physician referral) | Verified (text); product wording needs advice | 1219 ek md. 13 | retrieved 2026-11-27 |
| EU MDR: software with a medical purpose is a device | Verified (rule); specifics unverified | MDR Art. 2(1); MDCG 2019-11 rev.1 | 2025-06 |
| EU AI Act bans emotion recognition in education | Unverified (dates) | AI Act Art. 5(1)(f) | — |
| FDA General Wellness guidance reissued | Unverified | fda.gov town hall page | 2026-01-06 |

---

## 7. Questions for the mali müşavir and lawyer

**Lawyer (employment):**
1. I am a [public, kadrolu or sözleşmeli / private] school guidance teacher. Under 657
   md. 28, or my employment contract, may I: (a) open a şahıs işletmesi; (b) earn GVK 18
   copyright income from my own software; (c) hold shares in a Ltd that sells it, without
   managing it? Do I need permission from, or must I notify, my employer?

**Mali müşavir (tax):**
2. Is SaaS subscription income from software I wrote covered by **GVK 18** ("bilgisayar
   yazılımı ... kiralamak"), or is it ticari kazanç? Should we request an özelge, and with
   what facts?
3. If ticari kazanç: does the **GVK 89/13** 80% deduction apply when my only customer of
   record is Paddle.com Market Ltd (UK) and some end buyers are in Türkiye?
4. **KDV:** is the supply to Paddle exempt under 11/1-a and 12/2? How should sales to
   Turkish end buyers through Paddle be treated? What invoice do I issue to Paddle, and how
   often?
5. **Bağ-Kur:** given 5510 md. 53 and my 4/a or 4/c status, will a 4/b record open, and do I
   owe anything?
6. FX: is there a TCMB surrender requirement for service-export receipts from Paddle? Can I
   use a USD/EUR account?
7. Is ETBİS registration required? What e-Arşiv or e-fatura obligations apply?
8. Is a teknopark realistic for me, and does the genç girişimci exemption apply (age ___,
   first registration)?

**Lawyer (privacy and regulation):**
9. For Cloudflare, Supabase, Vercel and Paddle: which KVKK md. 9 basis do we use? Must we
   sign and notify the KVKK standard contract, and what if the vendor will not sign?
10. Do we need a GDPR **Art. 27 EU representative** (and UK equivalent) for a small SaaS
    with EU paying users? Does the answer change if any feature touches wellbeing data?
11. For a psychology or sport-psychology education product: review the landing page,
    feature names and disclaimers against 1219 ek md. 13, the advertising rules, EU MDR and
    US wellness rules. Does any feature make it a medical device or a health service?
12. Do our checkout, Terms and cancellation flow satisfy 6502 md. 52, the Mesafeli
    Sözleşmeler Yönetmeliği, and the EU withdrawal-button rule, given Paddle is the MoR?

## Sources

- 657 sayılı DMK: https://www.mevzuat.gov.tr/mevzuatmetin/1.5.657.pdf
- 193 sayılı GVK (md. 18, 89/13): https://www.mevzuat.gov.tr/mevzuatmetin/1.4.193.pdf
- 3065 sayılı KDVK (md. 6, 11, 12): https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3065.pdf
- 4691 sayılı TGB Kanunu: https://www.mevzuat.gov.tr/mevzuatmetin/1.5.4691.pdf
- 5510 sayılı SSGSS Kanunu (md. 53): https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5510.pdf
- 6698 sayılı KVKK (md. 6, 9, 18): https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6698.pdf
- 6502 sayılı TKHK (md. 48, 52): https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6502.pdf
- 1219 sayılı Kanun (ek md. 13): https://www.mevzuat.gov.tr/mevzuatmetin/1.3.1219.pdf
- KVKK standard contracts: https://kvkk.gov.tr/Icerik/7991/Standard-Contracts
- Paddle unsupported countries: https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle
- Paddle AUP: https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle
- Paddle identity verification: https://www.paddle.com/help/start/account-verification/what-is-identity-verification
- Paddle payout currencies: https://www.paddle.com/help/manage/get-paid/can-i-be-paid-in-my-local-currency
- Paddle Buyer Terms: https://www.paddle.com/legal/buyer-terms
- Stripe global: https://stripe.com/global
- Stripe Managed Payments eligibility: https://docs.stripe.com/payments/managed-payments/eligibility
- Lemon Squeezy update: https://www.lemonsqueezy.com/blog/2026-update
- Wise USD details: https://wise.com/help/articles/2810318/can-i-get-usd-account-details
- PayPal Türkiye exit (secondary): https://techcrunch.com/2016/05/31/paypal-to-halt-operations-in-turkey-after-losing-license-impacts-hundreds-of-thousands
- Cloudflare DPA: https://www.cloudflare.com/dpa/
- GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- MDCG 2019-11 rev.1: https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en?filename=mdcg_2019_11_en.pdf
- FDA General Wellness town hall: https://www.fda.gov/medical-devices/medical-devices-news-and-events/town-hall-refresh-general-wellness-policy-low-risk-devices-02112026
- EU withdrawal button (secondary): https://www.hoganlovells.com/en/publications/eu-consumer-protection-law-update-new-mandatory-withdrawal-button-what-online-traders-need-to-know
