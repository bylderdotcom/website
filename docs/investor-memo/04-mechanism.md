# Chapter 4 — How demand is formed before it reaches the market

> Draft for the Bylder investor memo. English, aimed at Zacua Ventures.
> This is the chapter a competitor cannot retell, because it describes an asset rather than an
> intention. Every element below exists today and is quoted from our own data.

## The unit of trade

Every marketplace in Chapter 2 trades in the same unit: a **lead**. A household that has already
worked out what it wants, raising its hand. A name, a postcode, a category, a phone number.

We trade in a different unit: a **decision**. A specific question, attached to a specific room,
in a specific home, closing on a specific date, worth a specific range.

The distinction is not semantic. A lead is what remains after the household has done the hard
part alone. A decision is the hard part, captured while it is still open.

## One decision, worked through

Take a real entry from our ontology — the utility room, and the first decision in it:

> **"Does the washing machine go here, or in the bathroom?"**
>
> This is the decision everything else hangs on. A washing set-up needs water, a drain, an
> earthed circuit and ventilation. Moving it after handover means opening walls.

Now watch what that single question triggers in our model:

| Triggered | Content |
|---|---|
| **Trades** | plumber, electrician, ventilation specialist, heat-pump installer, resin flooring, plasterer |
| **Extra-work items** (must be ordered before the contractual deadline) | sockets, three-phase power, ventilation, outdoor tap, spare conduit |
| **Product categories** | cabinets, vinyl flooring, lighting, doors |
| **Dependency** | the heat pump's indoor unit usually sits in the same room — it needs clearance, makes noise, and heats the space |
| **Cost path** | linked to our kitchen renovation cost model |

One question. Six trades, five extra-work items that expire, four product categories, and a
physical dependency on the heating system.

The household does not know any of this. It finds out when the wall is already closed.

## The graph

That is one decision. The model currently holds **25 residential spaces and 122 decisions**,
each carrying the same structure: which phase it falls in, which trades it involves, which
extra-work items expire with it, which product categories follow, what it typically costs, and
which mistakes people make.

It is not content. Content is what we render from it. The graph itself feeds the pages, the
AI assistant, the tools and the matching from a single source.

## Where the inputs come from

Three streams, all of which we already have:

**The date.** We track 976 active new-build projects covering at least 38,957 homes, with
location, size and expected completion. From that, and from a purchase date, the phase follows.

**The home.** Drawings uploaded to the home file are read automatically into surfaces and
quantities; the extra-work list and permit dossier sit beside them.

**The household's own correction.** We publish an estimate — expected handover, likely
deadlines — and invite the household to correct it from its own contract. That correction is
the reason to create an account, and it improves the model for everyone else in the same
project.

## What comes out

The household receives a counting-down list: *in the next fourteen months, 23 decisions; four
of them close before handover; here is what each is likely to cost.*

The supply side receives something no lead-generation platform can produce:

> Washing-machine connection, utility room, requires earthed circuit and mechanical
> ventilation, decision closes 14 March, budget €800–1,400, postcode 3012 — and 81 other
> households in this project face the same decision this quarter.

That final clause is the part that changes the economics. A trade company or a retailer is not
being sold a lead; it is being shown a **dated, specified, aggregated demand** in a defined
radius. That is a different conversation, at a different price, with a different close rate —
and it is only possible because the project layer sits underneath.

## Why this is what steering actually means

We do not decide who wins. Ranking is not for sale, at any price, and that constraint is
published.

What we do is decide **what the question is** — which decisions surface, in what order, with
what deadline and what budget band. By the time demand reaches the market it is already formed.
Suppliers compete on fit against a specification we produced, rather than on who bought the
lead fastest.

That is more influence over where €50,000 to €100,000 goes than any advertising position could
buy, and it does not require anyone to pay for placement. It also survives two things that
paid placement does not: regulation on ranking transparency, and AI assistants that route
around advertising entirely.

## What it would take to copy

Three things, and they do not compound in a competitor's favour:

**The graph.** 25 spaces and 122 decisions, with dependencies, deadlines and costs, is
domain work. It is not scraped and it is not generated; it is written and maintained.

**The project layer.** Completion dates and project sizes for the entire country, kept current.
We publish our counting openly, with the method, precisely because the barrier is not secrecy
but maintenance.

**The supply map.** 25,697 trade companies with services and coverage areas, plus retail and
production. Assembling this took months and it decays without continuous work.

An incumbent could build all three. But an incumbent whose revenue comes from selling leads
would be building the thing that makes its own product unnecessary — which is exactly the
position Angi is now in, and why it took an 81% volume loss to start moving.

---

## Source confidence

Everything in this chapter is our own and inspectable: the ontology lives in
`data/ruimtes/*.json` (25 files, 122 decisions), the project layer in our new-build monitor
(976 projects, 38,957 homes, published with its counting method), and the supply map in our
production database (25,697 trade companies across 8 trades). The utility-room example is
quoted verbatim from the model, translated.

**One thing to be careful about in the room:** the counting-down list and the aggregated
demand item are *built and specified*, not yet *running at volume* — we have 23 households.
Present the mechanism as what the round operationalises, not as what is already flowing.
An analyst who discovers that distinction unaided will discount everything else in the memo.
