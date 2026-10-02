# Weekly subscription plans and feature gating for a burst-use creator tool (Wordburn Pro)

Researched 2026-10-02. Scope: whether to keep, reprice or drop the weekly plan; where the free trial should sit; whether quotas or other gating are needed against "buy a week, batch the backlog, cancel". Wordburn's own numbers for reference: Play returned Rp 90.000/week, Rp 179.000/month, Rp 690.000/year on the A54 (CLAUDE.md, 2026-10-01), so weekly × 52 = Rp 4.68M ≈ **6.8× yearly** and ≈ 2.2× monthly; the project note's "$4.99/week = $259/year" is the same ratio in dollars.

A note on the two big datasets, because they disagree in places: RevenueCat's *State of Subscription Apps 2026* covers 115,000+ apps / $16B; Adapty's *State of In-App Subscriptions 2026* covers ~16,000 apps / $3B+. Both are vendor reports over their own customers, not the whole market, and their "first renewal" figures for weekly plans differ by 20+ points (see Q1), which is most likely a definition difference (trial cohorts vs all cohorts, median-of-apps vs pooled) that neither page spells out.

---

## Q1. What published data says about weekly plans: revenue share, churn, LTV vs monthly, conversion to longer plans, categories, refunds and store scrutiny

### Takeaway
Weekly plans are now the single largest revenue source in subscription apps (55.5% of revenue in Adapty's 2025/26 data, up from 43.3% in 2023), but they are a volume-and-churn model: year-one retention of weekly subscribers is 3.4% (RevenueCat, 2025) to 5.5% (Adapty, trial cohorts), and RevenueCat explicitly calls weekly "a revenue trap" when it cannibalises longer plans. In Photo & Video, 38.8% of subscribers are on weekly plans; weekly plans rarely exceed 30% of category revenue outside Gaming. No source reports a weekly-to-annual switching rate.

### Cited Findings
- Weekly subscriptions generated 43.3% of all subscription app revenue two years ago and 55.5% by 2025, "a 12 percentage point shift in 24 months"; monthly fell from 21.1% to 11.7% and annual from 29.2% to 22.5% over the same window — [Adapty, Weekly vs monthly vs annual (2026)](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/); same 55.5%/43.3% figure in [Adapty State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/).
- Weekly plan share of subscribers by category (RevenueCat data): Gaming 77%, Business 44.7%, Social & Lifestyle 40.9%, **Photo & Video 38.8%**, Utilities 36.1%, Travel 5.3%, Education 4.5%. By region: India/SEA 36.4%, Middle East 34.6%, LatAm 31.3% — [RevenueCat, Weekly subscriptions: when do seven-day plans make sense? (2025)](https://www.revenuecat.com/blog/growth/weekly-subscriptions).
- "Weekly plans rarely exceed 30% of category revenue except Gaming"; weekly plan retention "rarely exceeds 10% at six months, with many categories seeing retention below 5%" and falls below 10% at 12 months overall — [RevenueCat State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025).
- Median weekly price $4.99 vs $6.68 monthly; a weekly subscriber who stays pays about **3.23× more per year** than a monthly one. Year-one retention of weekly subscribers: 4.2% (2024) → **3.4% (2025)**. The article warns weekly can become "a revenue trap" if it cannibalises longer plans without an LTV gain, and lists "higher churn, increased refund requests, and elevated cancellation rates" as the specific risks — [RevenueCat, Weekly subscriptions (2025)](https://www.revenuecat.com/blog/growth/weekly-subscriptions).
- RevenueCat 2026 first-renewal **churn** by plan: weekly 42–65%, monthly 39–58%, annual 60–77% (i.e. weekly first-renewal retention 35–58%); "84% of cancellations happen between Day 0 and Day 1" for 3-day-trial weekly plans — [RevenueCat, Curse of the first renewal (2026)](https://www.revenuecat.com/blog/growth/first-renewal-churn).
- Adapty 2026 gives a very different weekly first-renewal band: **74–81% renew** across price tiers, vs monthly 48–58% and annual 66.3%; weekly is the least price-sensitive plan at renewal, monthly the most (8–10 pt drop from low to high price tiers) — [Adapty, Weekly vs monthly vs annual (2026)](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/); restated by [Airbridge (2026)](https://www.airbridge.io/en/blog/weekly-vs-annual-subscription-app). **Conflicts with RevenueCat's 35–58%**; the definitions are not stated on either page.
- Adapty: on weekly plans, trial users renew at 59.2% after the first cycle vs 37.0% for direct buyers; 65% of weekly subscribers churn by day 30; day-380 retention with trial: annual 19.9%, monthly 14.2%, **weekly 5.5%** — [Adapty State of In-App Subscriptions 2026 (search summary)](https://adapty.io/blog/mobile-app-monetization-2026/) and [Adapty report page](https://adapty.io/state-of-in-app-subscriptions/).
- Adapty 12-month LTV per subscriber: **weekly + trial $49.27, annual + trial $36.51**, monthly + trial ~$28–30; "LTV accumulates through volume and repeated short renewal cycles — not through high retention." Adapty's recommendation is to "lead with weekly + trial for most categories" and "avoid monthly as primary offer" — [Adapty (2026)](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/).
- Weekly plans convert installs to trials at up to 5.4× the annual rate (9.8% vs 1.8%) — [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025); "weekly plans convert 1.7–7.4× better than annual across all price tiers" — [Adapty (2026)](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/).
- Weekly-dominant apps show D14 revenue per install of $0.19 and D60 of $0.32 — [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps).
- Refunds: Adapty reports Photo & Video refund rates of 14.1% in APAC vs 6.4% globally (not broken down by plan length) — [Adapty (2026)](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/). RevenueCat defines refund rate as "the share of paid subscriptions that are refunded during their first billing period" but the public report does not publish it by plan — [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps).
- Store scrutiny: Google Play requires clear disclosure of "the cost of subscriptions, the frequency of billing cycles, automatic renewal terms" with no additional user action, prohibits obscuring the renewal price after an intro period, and requires that subscriptions "provide sustained or recurring value… and may not be used to offer what are effectively one-time benefits" — [Play Console Help, Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en). I found no policy that singles out weekly billing; weekly is an ordinary billing period in Play Console — [Play Console Help, Create and manage subscriptions](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
- Upgrade paths (not weekly-specific): an in-app offer to switch to annual at a discount shown after three renewals converts 8–14%; an annual-offer email at day 90 converts 4–8% — [Airbridge, Weekly vs annual (2026)](https://www.airbridge.io/en/blog/weekly-vs-annual-subscription-app) (consultancy figures, no dataset stated).
- RevenueCat's five-point vetting list for a weekly plan: category alignment, short-term use-case fit, a trial strategy that avoids confusion, a user segment distinct from monthly buyers, and CAC economics that survive low retention — [RevenueCat, Weekly subscriptions (2025)](https://www.revenuecat.com/blog/growth/weekly-subscriptions).

### Inferences
- Both datasets agree on the shape: weekly wins on conversion and (per Adapty) on pooled 12-month LTV, and loses badly on retention. The LTV win depends on *volume of new weekly buyers*, which is a paid-UA model. Wordburn has no UA budget and no analytics, so the half of the weekly model that pays is the half it cannot run; the half that bites (3–5% year-one retention, refund pressure) is the half it would get.
- The "revenue trap" RevenueCat names is exactly the project note's worry: a clipper who would have bought a year at Rp 690.000 buys one week at Rp 90.000, clears the backlog, and leaves. There is no published switching rate from weekly to annual, so nothing supports "they'll upgrade later."
- Photo & Video's 38.8% weekly share and 14.1% APAC refund rate (Wordburn's launch market is Indonesia) mean a weekly plan in this category and region is at the high end of both adoption and refunds.

### Gaps
- No source publishes weekly → annual plan-switch rates. The 8–14% figure is for explicit upgrade offers from monthly, from a consultancy, with no dataset.
- No source publishes refund or complaint rates split by billing period; RevenueCat mentions "increased refund requests" for weekly qualitatively only.
- Reddit (r/androiddev, r/iOSProgramming) is blocked to the search tool used here, so no developer first-hand threads could be read.
- The Phiture pricing guide surfaced only generic anchoring advice ("show a high tier first"), nothing weekly-specific — [Phiture, App Pricing Optimization Guide](https://phiture.com/mobilegrowthstack/app-pricing-optimization-guide/). AppAgent: nothing found.

---

## Q2. Burst-and-cancel behaviour and how AI video / clipping tools gate it (quotas, credits, rollover)

### Takeaway
Every direct competitor examined (Opus Clip, Submagic, Klap, Vizard, Descript, Captions) sells monthly/yearly only — **none offers a weekly plan** — and every one meters usage per month (minutes, clips, videos or credits). The metered quota, not the billing period, is what stops a one-month backlog dump: a clipper who buys a month gets a month's allotment, and rollover is limited (Opus Clip 60 days on monthly, Vizard two months, Descript none). I found no published measurement of burst-and-cancel rates.

### Cited Findings
- **Opus Clip**: Free 60 / Starter 150 / Pro 300 processing minutes per month; "If you are on a monthly plan, your paid credits will last for 60 days, which means that you get one month of rollover credits. After these 60 days the credits will expire." Yearly: "all your credits will be valid for 12 months." On cancel, "the remaining credits will expire at the end of your current billing cycle." — [Opus Clip help, Where did my minutes go?](https://help.opus.pro/docs/article/where-did-my-minutes-go); plan minutes from [Castmagic, OpusClip pricing (2026)](https://www.castmagic.io/blog/opus-clip-pricing). Annual plans grant the full allotment upfront — [eesel, OpusClip pricing (2026)](https://www.eesel.ai/blog/opusclip-pricing).
- **Submagic**: Starter $19/mo ($12 annual) = 45 credits = 15 videos/month, max 2 min; Pro $39 ($23 annual) = 120 credits = 40 videos, max 5 min; Business $69 ($41 annual) = 300 credits = 100 videos, max 30 min; free tier 3 videos/month watermarked. Monthly or annual only; rollover not stated on the pricing page — [Submagic pricing](https://www.submagic.co/pricing); free-tier detail from [fluxnote (2026)](https://fluxnote.io/guides/submagic-free-plan-limits-2026).
- **Klap**: Basic $14/mo billed yearly = 100 clips/mo; Pro $39 = 300 clips/mo; Pro+ $94 = 1,000 clips/mo; "Only pay for clips you generate." No rollover statement — [Klap pricing](https://klap.app/pricing).
- **Vizard**: Free 60 minutes/month; Creator $29/mo = 600 upload minutes; 1 credit = 1 upload minute. "The monthly usage (minutes upload) will renew every month and will accumulate to the next month" — [Vizard help, How does the pricing plan work?](https://help.vizard.ai/en/articles/8767574-how-does-the-pricing-plan-work); third-party summary says each monthly release stays valid two months and each yearly release 13 months, rollover spent first — [AI Tool Curator, How Vizard credits work (2026)](https://www.aitoolcurator.com/learn/vizard-ai-how-to-guide/how-credits-work/).
- **Descript**: Hobbyist 600 / Creator 1,800 / Business 2,400 media minutes per month; "Unused media minutes don't roll over monthly… unused AI Credits don't roll over"; top-ups expire 12 months after purchase and are only sold on Creator and Business — [Descript Help, Top-ups](https://help.descript.com/billing-payments-plans/top-ups) and [Descript Help, Track media minutes and AI credits](https://help.descript.com/hc/en-us/articles/27841674958221-Track-and-understand-your-media-minutes-and-AI-credits); prices from [Sonix, Descript pricing (2026)](https://sonix.ai/resources/descript-pricing/).
- **Captions (captions.ai)**: Free (60–200 lifetime credits), Lite $4.99/mo (**Android only**), Basic $9.99 = 200 credits/mo, Max $24.99 = 500, Frontier $69.99 = 1,400, up to Frontier 4× $279.99 = 5,600; "monthly or yearly subscriptions, and you can cancel at any time"; credits "renew monthly"; rollover not stated — [Captions Help Center, Subscriptions & Plans](https://captions.ai/help/docs/subscriptions).
- Captions' credit system draws complaints: users "pay for a subscription but are still limited by credits that run out quickly, feeling like they're being charged twice" — [eesel, Captions AI deep dive (2025)](https://www.eesel.ai/blog/captions-ai). Trustpilot (475 reviews, 4.4): "I uploaded a video for captions. When I went to export my video it wouldn't allow me to, and then wanted more money" (1-star, 23 Sep 2026); but also "I subscribed then unsubscribed within a few hrs and the team fully refunded me" (5-star, 27 Sep 2026) — [Trustpilot, Captions](https://www.trustpilot.com/review/captions.ai).
- Opus Clip's cancellation flow is criticised on Trustpilot as multi-step — [Castmagic (2026)](https://www.castmagic.io/blog/opus-clip-pricing).
- Google Play policy: subscriptions "may not be used to offer what are effectively one-time benefits" — [Play Console Help, Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en).

### Inferences
- The category has converged on *monthly quota + annual prepay of the quota + capped rollover*. For Wordburn, whose marginal cost is zero, the quota is not about cost; it is the mechanism that makes a month's price buy a month's work. The CLAUDE.md batch cap (20 clips per queue) is a per-run cap, not a per-period one, and does nothing against "buy a week, run ten batches, cancel".
- A per-period quota brings its own complaint class (Captions' "charged twice"). The cleanest version for an on-device app is a generous quota that no honest weekly user hits but a backlog dump does — e.g. N batch clips or auto-clip minutes per billing period — stated on the paywall, since Play's disclosure rule covers "any other material information about the subscription."
- Because none of these competitors sell weekly, dropping Wordburn's weekly plan would not leave it out of step with the category; keeping it would make Wordburn the only weekly in the set.

### Gaps
- No published data on how often subscribers to these tools buy one month and cancel; the tools do not disclose churn.
- Submagic, Klap and Captions do not state their rollover rule on the pages fetched.
- Terms-of-service pages were not fetched for anti-abuse or fair-use clauses; none of the help pages read mentioned one.

---

## Q3. Trial placement (yearly vs monthly), 3-day vs 7-day, and which plan to preselect

### Takeaway
The 17,000-app RevenueCat dataset (Aug 2025–Jul 2026) says longer trials convert and renew better on every plan, and that a 3-day trial on an annual plan is the worst cell in the table (24% conversion, 18.3% first renewal); the "7-day trial wins at 5.2%" claim is a paywall-level stat from a different dataset and measures something else. Preselecting annual roughly doubles annual selection (69% vs 28%, Adapty). The trial should stay on yearly, be 7 days rather than 3, and yearly should be preselected.

### Cited Findings
- RevenueCat, 17,000+ apps, Aug 2025–Jul 2026, App Store and Google Play. **Annual**: ≤4-day trial 24% conversion / 18.3% first renewal; 5–9 days 33% / 25.3%; 10–16 days 43% / 36.4%; 17–32 days 44.6% / 47.5%; no trial 26.6% first renewal. **Monthly**: ≤4 days 39.6% / 54.2%; 5–9 days 45.9% / 62.8%; 10–16 days 46.6% / 72.0%; 17–32 days 43.7% / 77.5%; no trial 49.5%. **Weekly**: ≤4 days 22.3% / 57.9%; 5–9 days 24.3% / 65.9%; no trial 35.9% first renewal. Most weekly apps (81–100% in some categories) use ≤4-day trials; Photo & Video prefers ≤4-day trials on monthly — [RevenueCat, How long should your free trial be? (2026)](https://www.revenuecat.com/blog/growth/free-trial-length).
- "Trials of 17+ days convert 70% better than short trials (42.5% vs 25.5%)"; Photo & Video has 68.2% of trials at ≤4 days — [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps).
- Adapty: trial users retain 1.4–1.7× better than direct buyers at first renewal across plan types; but in Lifestyle trials cut LTV by 21.2% and in Productivity direct buyers out-earn trial users ($56.95 vs $49.13) — [Adapty (2026)](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/).
- Preselection: "apps that pre-select the annual plan see 69% annual selection rates versus 28% when monthly is default"; with annual preselected, average revenue per paywall view $2.99 and 12-month LTV per subscriber $74.80 — attributed to Adapty 2025 benchmarks by [RocketShip HQ (2026)](https://www.rocketshiphq.com/optimize-app-paywall-higher-conversion/). **Secondary source**; Adapty's own page with this table was not located.
- Aggregator claim: "apps with 7-day free trials convert at 5.2%", 3-day 3.1%, 14-day 4.0%, 30-day 2.3%, attributed to Superwall's 2025 paywall benchmark; hard paywall 6.1% vs soft 3.8% trial-to-paid; a "trial timeline" paywall at 5.6% beat an "annual focus" paywall at 4.1% with +32% proceeds per user — [asohack (2025)](https://asohack.com/blog/7-day-trial-paywall-conversion-data-2025). These are paywall-view-to-conversion rates, not trial-to-paid, so they are not the same metric as RevenueCat's; I could not find the Superwall primary.
- Google Play free trials must be between 3 days and 3 years and attach to a base plan as an offer phase, with eligibility restrictable to new customers — [Play Console Help, Create and manage subscriptions](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
- Nearly a third of all subscription cancellations on Google Play are involuntary billing failures, more than double the App Store's 14% — [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps).

### Inferences
- Wordburn's current design — 3-day trial on yearly only — sits in the single worst-performing cell RevenueCat measured (24% conversion, 18.3% first renewal). Moving it to 7 days (5–9 bucket: 33% / 25.3%) is the smallest change with the clearest evidence; 14 days would be better still by that table, but on a tool whose value is the export, a 14-day trial is two weeks of free, watermark-free backlog clearing, which is the burst problem in a new coat.
- A 7-day trial on *yearly* also answers the clipper directly: the free week is the "one week" they were going to buy. If the trial is the backlog-clearing week, the weekly plan has no job left.
- Yearly should be preselected; the 69%/28% figure is the strongest single paywall lever found, and it costs nothing.
- The Play involuntary-churn figure argues for the longest grace period Play allows on whichever plans remain (see Q5).

### Gaps
- No source directly compares "trial on annual only" vs "trial on monthly only" on the same paywall; the RevenueCat table is per-plan, not per-configuration.
- Adapty's primary table for the 69%/28% preselection figure was not located; it is quoted via a consultancy.
- No data on trial abuse (people who clear a backlog in the trial and cancel) in any source.

---

## Q4. Alternatives to weekly: prepaid pass, introductory monthly, lifetime, credit packs

### Takeaway
Google Play already has the "buy a week, no renewal" product: a **prepaid base plan** (1 day to 1 year, no auto-renew, top-ups stack, switchable to auto-renew) — but it cannot carry offers or a trial. One in four apps now offer a lifetime plan, at 2–12× annual (3–5× is the common rule), and Photo & Video is the category with the highest lifetime adoption; RevenueCat's own guide warns it cannibalises high-LTV subscribers and gives no revenue-effect numbers. No published outcome data exists for pay-per-export credit packs in this category beyond the top-up products Descript and Opus Clip sell.

### Cited Findings
- **Prepaid base plans (Play)**: durations "from 1 day to 1 year", "do not automatically renew", customers "must proactively purchase top-ups"; "Prepaid base plans do not support offers. They also cannot be marked as backwards compatible"; a top-up immediately expires the old order and creates a new one whose expiry is the old date plus the top-up's full duration; customers can switch between prepaid and auto-renewing base plans within the same subscription — [RevenueCat docs, Google Prepaid Plans](https://www.revenuecat.com/docs/subscription-guidance/google-prepaid-plans); "Allow extension" and 1-day-to-1-year durations confirmed in [Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504?hl=en). Prorated refunds are supported for prepaid plans with a duration of at least one week — [Android Developers, Manage subscriptions and one-time purchases](https://developer.android.com/google/play/billing/manage-purchases).
- Play's base-plan model was introduced in May 2022 precisely so one subscription can be sold "in multiple ways" (auto-renewing and prepaid) without a SKU per variant — [Android Developers Blog (2022)](https://android-developers.googleblog.com/2022/05/new-ways-to-sell-subscriptions-on-google-play_0530335598.html).
- **Lifetime**: "One in four apps offer a lifetime plan" — [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps). Photo & Video leads lifetime adoption; most other categories 18–24%; Business rarely — [RevenueCat, A guide to lifetime subscriptions (2025 data)](https://www.revenuecat.com/blog/growth/lifetime-subscriptions).
- Lifetime multiples from that guide: Calm $79 annual / $399 lifetime (5.0×), Jumpspeak 3.6×, Moonly 2.1×, Waking Up $129.99 / $1,500 (11.5×), Placify 3.3×; range 2–12×; "when unsure, price higher rather than lower." Risks named: "cannibalize loyal high-LTV customers", erode MRR, limit upsells. **No quantified revenue-share or cannibalisation figures** are given — [RevenueCat, Lifetime subscriptions](https://www.revenuecat.com/blog/growth/lifetime-subscriptions). A common indie recipe is "lifetime purchase as an anchor priced 3–4× the annual price" — [appopportunity (2026)](https://appopportunity.com/blog/indie-app-revenue-models-2026) (opinion, no data).
- One-time purchases including lifetime are ~10.3% of app revenue; 35% of apps mix subscriptions with consumables or lifetime — [Adapty 2025 report via search summary](https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/); only 2.5% of all apps combine subscriptions, consumables and lifetime (Gaming 9.6%) — [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps).
- **Credit packs / top-ups in the category**: Descript sells media-minute and AI-credit top-ups that expire after 12 months, only to Creator/Business subscribers — [Descript Help, Top-ups](https://help.descript.com/billing-payments-plans/top-ups). Captions sells Frontier 2× and 4× tiers rather than packs — [Captions Help](https://captions.ai/help/docs/subscriptions). I found no caption/clipping app selling a standalone pay-per-export pack.
- Wordburn already carries a lifetime SKU: `captions_unlock_v1` "is never sold again and is still queried on every launch: whoever owns it has Pro for life" — CLAUDE.md (project, 2026).
- Introductory pricing: Play allows single-payment and recurring-payment intro offers as offer phases on auto-renewing base plans, with eligibility limited by subscription history — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504?hl=en). I found no published conversion data specific to an "intro monthly" versus a weekly plan.

### Inferences
- A **7-day prepaid plan** is the honest version of what the weekly plan is for: the clipper pays for the week they want, nothing renews, nobody writes a "charged weekly" review, and Play handles the SKU inside the same `wordburn_pro` subscription so `pro.ts` sees it as a subscription with an expiry. What it costs: no trial on it (Play forbids offers on prepaid), and prepaid buyers never become the 3–5% who forget to cancel — which is precisely the revenue RevenueCat says weekly plans live on.
- Pricing a 7-day prepaid at or above the current weekly (Rp 90.000) keeps the anchor that makes yearly look cheap; pricing a 30-day prepaid at monthly keeps monthly honest too.
- Reviving the lifetime unlock at 3–5× yearly (Rp 2.1M–3.5M) is plausible for a category where lifetime adoption is highest and marginal cost is zero, but the project already moved off "pay once" deliberately (slice 15) and no source quantifies what lifetime does to annual conversion; it is a bet, not an evidence-backed move.
- Credit packs for an on-device app would be an invented scarcity; nothing in the category does it standalone, and the Captions complaint class ("charged twice") is the reported downside.

### Gaps
- No developer reports on prepaid-plan adoption, conversion or revenue share on Play were found; Google publishes none.
- No quantified lifetime-vs-subscription revenue effects anywhere in the RevenueCat or Adapty material read.
- Indie case studies with revenue numbers (X, Indie Hackers, Medium) were not reached in this pass.

---

## Q5. Google Play specifics: prepaid plans as the "pass", pausing, grace period defaults, one-time products

### Takeaway
Play supports weekly billing, prepaid base plans of 1 day to 1 year that do not renew, user-pausing from one week to three months (for auto-renewing plans; not for add-ons), grace periods of 3 or 7 days on weekly plans, and account hold defaulting to 60 days minus the grace period. A one-time product granting timed access would run into Play's rule that subscriptions, not one-time products, are for recurring value; prepaid plans exist to cover that case.

### Cited Findings
- Billing periods available for auto-renewing base plans: "Weekly, Every 4 weeks, Monthly, Every 2 months, Every 3 months, Every 4 months, Every 6 months, Every 8 months, Yearly" — [Play Console Help, Create and manage subscriptions](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
- Grace period: configurable per base plan; for weekly billing periods the options are 3 or 7 days — [Play Console Help (search summary)](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
- Account hold: "By default, all auto-renewing base plans and installment plans have account hold enabled and the lengths are automatically calculated. The calculation will be 60 days minus any grace period duration"; grace + hold must total at least 30 days — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
- Pause: enabled globally in monetization settings; "User pausing or resuming subscriptions with add-ons isn't supported"; from the user side, a paused subscription pauses at the end of the current billing period and durations "can range from one week to three months" — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504?hl=en) and [Google Play Help, Cancel, pause, or change a subscription](https://support.google.com/googleplay/answer/7018481?hl=en). I did not find a statement that pausing is unavailable on weekly plans specifically.
- Resubscribe: users can "repurchase an expired auto-renewing subscription in the Play Store" (auto-renewing and installment plans) — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
- Prepaid plans: see Q4 — 1 day to 1 year, no auto-renew, no offers, top-ups stack, switchable to auto-renewing within the same subscription — [RevenueCat docs](https://www.revenuecat.com/docs/subscription-guidance/google-prepaid-plans); prorated refunds for prepaid plans of at least one week — [Android Developers](https://developer.android.com/google/play/billing/manage-purchases).
- Free trials: 3 days to 3 years, as an offer phase on an auto-renewing base plan — [Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
- Policy: subscriptions must "provide sustained or recurring value… and may not be used to offer what are effectively one-time benefits"; terms, cost and billing frequency must be disclosed without additional user action — [Play Console Help, Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en).
- Nearly a third of Play subscription cancellations are involuntary billing failures (vs 14% on iOS) — [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps).
- Play's 2020 policy update against "fleeceware" targeted unclear terms and hard cancellation rather than any billing period — [TechCrunch (2020)](https://techcrunch.com/2020/04/16/new-google-play-policies-to-cut-down-on-fleeceware-deepfakes-and-unnecessary-location-tracking).

### Inferences
- The "pass" the project might want is not a one-time product; it is a prepaid base plan on `wordburn_pro`, which expo-iap will surface as a subscription purchase with an expiry and no auto-renew. `pro.ts` would need a `prepaid` case (period type `PREPAID` in RevenueCat's terms) that is Pro until expiry and never "renewing".
- With a third of Play cancellations involuntary, the 7-day grace on weekly (and the maximum on monthly/yearly) is worth setting explicitly rather than leaving at defaults.

### Gaps
- Whether expo-iap 5.6 exposes prepaid-plan purchases distinguishably (e.g. no `autoRenewing` flag, or a specific field) was not checked; it is a code question, not a research one.
- No developer-reported numbers on prepaid plan uptake on Play.

---

## Q6. Caption / video apps: price points, "charged weekly" complaints, and what reduced churn

### Takeaway
The caption apps on Play that draw billing complaints draw them for card-up-front trials, charges continuing after cancellation, and credit limits inside a paid plan — not for weekly billing as such. Captions' only sub-$5 plan ($4.99 Lite) is monthly and Android-only. No caption app publishes churn by price point, so there is no evidence that any specific price "reduced churn".

### Cited Findings
- Captions (captions.ai) complaint themes: "unexpected charges and difficulties when trying to cancel memberships" (Trustpilot summary); a credit system that feels like being "charged twice"; one reviewer "mentioned requesting weekly price options instead of a whole month"; another "requested to cancel their membership months ago… their account kept getting charged" — [eesel, Captions AI deep dive (2025)](https://www.eesel.ai/blog/captions-ai) and [Trustpilot](https://www.trustpilot.com/review/captions.ai).
- Captiono: AI Subtitles (Play, 4.7 stars, 22,000+ reviews): a user "requested to cancel their membership but their account kept getting charged with no response to multiple support emails" — [Google Play listing (search summary)](https://play.google.com/store/apps/details?id=ai.captiono.app&hl=en_US).
- Subcap (Play): "does not even allow captions without submitting a credit card… demands a payment card just to try auto-captions" — [Google Play listing (search summary)](https://play.google.com/store/apps/details?id=com.ratel.subcap&hl=en_US).
- Captions Lite is $4.99/month on Android only; Basic $9.99 = 200 credits — [Captions Help Center](https://captions.ai/help/docs/subscriptions).
- Opus Clip: cancellation flow criticised as multi-step on Trustpilot — [Castmagic (2026)](https://www.castmagic.io/blog/opus-clip-pricing).
- Google Play's own help text tells users subscriptions are "charged at the beginning of each billing cycle… (for example, weekly, annually, or another period), unless you unsubscribe" and that uninstalling does not cancel — [Google Play Help](https://support.google.com/googleplay/answer/7018481?hl=en&co=GENIE.Platform%3DAndroid).

### Inferences
- The reputational risk in this category is "kept charging me" and "paid but still gated", not "weekly". A weekly auto-renew on Wordburn would add the first; a per-period quota would add the second unless it is generous and disclosed on the paywall.
- One Captions reviewer asked for a weekly option, which is the only direct voice found for demand; it is one review.

### Gaps
- Play Store reviews were only reached through search snippets; no systematic read of reviews mentioning "weekly" on caption apps was possible with the tools available.
- No caption or clipping app publishes churn, refund or complaint rates by plan, so "which price point reduced churn" cannot be answered from public data.

---

## Synthesis for the decision (inference, drawing on everything above)

1. **Weekly auto-renew**: the published upside (Adapty's $49.27 weekly+trial LTV) is a paid-acquisition, high-volume model built on 3–5% year-one retention and a forgotten-cancel tail; RevenueCat calls the cannibalisation case a "revenue trap" and names refunds and complaints as the cost. None of the six competitors sells weekly. Wordburn's weekly is 6.8× yearly — an anchor, as the project note says — and the anchor can be kept without the renewal.
2. **Replace it with a 7-day prepaid base plan** at the same or a higher price: the clipper's "one week" exists, nothing renews, no "charged weekly" review, and the yearly still looks cheap next to it. Cost: no trial on prepaid (Play rule), and no forgotten-renewal revenue.
3. **Trial**: stay on yearly, go from 3 to 7 days (RevenueCat: 24%→33% conversion, 18.3%→25.3% first renewal on annual), preselect yearly (69% vs 28% annual selection). The 7-day trial *is* the backlog week for anyone who wants one free, which is a further reason the weekly plan has no job.
4. **Quota**: the category meters per month (Opus 150–300 min, Submagic 15–40 videos, Klap 100–300 clips, Vizard 600 min, Descript 600–1,800 min) with capped rollover. For an on-device app the quota's only purpose is to make a period's price buy a period's work; if the weekly auto-renew goes, the burst problem shrinks to the trial and the prepaid week, and a generous, disclosed per-period cap on batch/auto-clip (not on single-clip exports) is enough. Captions' reviews show what an ungenerous one earns.
5. **Lifetime**: evidence that it is common (1 in 4 apps; highest in Photo & Video) at 3–5× yearly, and no evidence either way on what it does to annual conversion. The project retired "pay once" on purpose; nothing here overturns that.
