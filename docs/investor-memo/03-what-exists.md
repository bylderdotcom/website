# Chapter 3 — What exists, and what does not

> Draft for the Bylder investor memo. English, aimed at Zacua Ventures.
> All figures are our own, measured August 2026, and reproducible from our systems.

Bylder started in **May 2026**. Three months. This chapter states precisely what that bought,
and precisely what it did not — because the asymmetry is the point, not something to work
around.

## The supply side is mapped

| | |
|---|---|
| Trade companies, structured | **25,697** across 8 trades, with location, ratings, services and coverage area |
| Retail, interior and design businesses, Rotterdam region | **1,718**, of which 1,226 with a verified contact address |
| Prefab and production companies in that set | 99 |
| Active new-build projects tracked | **976**, covering at least **38,957 homes** |
| Residential spaces modelled | **25**, each with its decisions, phases, cost paths and trades |
| Knowledge base | 221 articles, averaging 888 words, **91% unique text** |

That last number matters more than it looks, and we will come back to it.

## The demand side is not

| | |
|---|---|
| Registered households | **23** |
| Of which linked to a specific new-build project | 11 |
| Tenders placed | **0** |
| Paying consumer accounts | **0** — the consumer product is free by design |
| Paying business participants | **1** |
| Organic search clicks, per month, whole site | **108**, at average position 29.6 |

One paying customer. Twenty-three households. We are not going to dress that up.

## Why we built it in this order

Two-sided markets fail on whichever side is harder to assemble. For us that is supply: 25,697
trade companies with structured service data, coverage areas and ratings is not something you
buy, and it is not something a competitor assembles in a quarter. Demand, by contrast, arrives
at a predictable moment — 200,000 households a year, on dates we can already see.

So we built the side that takes years, first, and we built the machinery that turns a household
into a structured demand item. What this round buys is the side that takes months.

That is the intended reading. Here is the part that is less flattering, and more useful.

## What we got wrong, and what we did about it

The original distribution thesis was volume: publish a page for every trade company in every
town, and let search do the rest. By July we had **56,649 URLs**.

In July we measured it properly, for the first time, using Search Console's URL Inspection API
across a sample of the 14,191 indexable company profiles:

| | |
|---|---|
| Unknown to Google | **55%** |
| Discovered, never crawled | **37.5%** |
| Actually indexed | **7.5%** |
| Impressions in a month, all 14,191 pages | **8** |
| Clicks | **0** |

We then measured why. Each profile carried roughly 527 visible words, of which **67–70% was
identical** to another profile in the same trade. Around 180 words per page were genuinely its
own. The knowledge base, by contrast, ran at 91% unique — and was three times better indexed
despite being weeks old rather than months.

The conclusion was unambiguous, so we acted on it: **on 31 July we removed all 25,697 company
profiles from the index** and emptied them from every sitemap. A quarter of the site's URLs,
switched off in one commit, because the data said they were consuming crawl budget the rest of
the site needed.

We would rather an investor heard that from us than found it. Two things follow from it.

**First, the asset was never the pages.** It is the structured data underneath them — the
trades, the services, the coverage areas, the 25 modelled rooms with their decisions and
deadlines. Those pages were one way to express that data, and a poor one. The decision graph
survives the pages being wrong.

**Second, we can tell.** We built the measurement apparatus before we needed it, and when it
returned an inconvenient answer we followed it within a day. A company that publishes 56,649
pages and never measures them is a different risk than one that measures and cuts. This round
is capital that will be spent under the same discipline.

## What is built beyond content

Not a website with a form on it. The working parts:

- **The home file** — drawings uploaded and read automatically into surfaces and quantities,
  extra-work lists, permit dossiers, warranty items.
- **The tender loop** — a household places a request pre-filled from its own file; matching
  trade companies receive a complete specification and respond with a proposal that is
  benchmarked against our own price data.
- **The participant layer** — self-service onboarding, vouchers, payment, moderation.
- **The measurement layer** — Search Console integration, a claim checker that verifies page,
  metadata and structured data all assert the same thing, and 21 scheduled processes keeping
  catalogue and pricing current.
- **The public counting** — our new-build completion monitor, published openly with its method,
  is the first structured view of what is being delivered in the Netherlands and when.

## The honest summary

We have three months of building, a mapped supply side, a modelled decision graph, working
software on both sides of the transaction, and almost no users.

The market thesis in Chapter 1 does not depend on our traction; it depends on 200,000
households a year arriving at a knowable moment. What this round buys is the demand side, and
Chapter 6 sets out exactly how — including the parts we have already tested and the one
assumption everything rests on.

---

## Source confidence

Every figure in this chapter is our own and reproducible from our own systems:
Supabase counts as of 2 August 2026, Google Search Console API for the indexing and
performance figures, and our own text-uniqueness measurement (8-word shingle overlap across a
random sample per trade). The 25,697 profiles were removed from the index in commit
`0a5ea66` on 31 July 2026 and the change is verifiable on the live site.
