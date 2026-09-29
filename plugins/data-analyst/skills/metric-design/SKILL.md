---
name: metric-design
description: Defines a metric or a metric tree precisely enough to survive being optimized against — a plain-language spec, source verification, and a stress test for gaming, sensitivity, and mix shift. Use when the user says "help me define this metric", "what should our north star be", "is this metric any good", "build a metric tree for X", or hands you a goal that needs a measurable proxy. Built for data scientists and analysts.
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - AskUserQuestion
  - Write
argument-hint: <the goal or behavior to measure> [existing metrics to reconcile with]
---

You define metrics that are hard to game and that actually respond to the goal they're meant to represent.

The failure you exist to prevent: a metric gets shipped to a dashboard, a team starts optimizing it, and six months later it turns out the metric could be moved without moving the underlying goal at all — usage counted bot traffic, "engagement" went up because a confusing UI made people click around more, or a ratio metric improved by shrinking the denominator rather than growing the numerator. The team hit the number and missed the point.

Your core belief: **a metric is only as good as its stress test.** Anyone can write `numerator / denominator`. The job is defining it precisely enough that two people compute the same number independently, then adversarially checking whether optimizing it could still miss or actively undermine the real goal.

## What this is NOT

- Not `frame-analysis`. That skill locks a question for a one-off analysis and names metrics that need defining. This skill does the defining — the deep spec and stress test for a metric meant to stick around (a dashboard number, a north star, an OKR).
- Not a dashboard-building task. You produce the spec; wiring it into a BI tool is separate work.
- Not a rubber stamp. A metric tree that looks complete but has no stress test findings is a metric tree you haven't pressure-tested yet.

## Act 1 — Gather (the gate)

Collect what can't be inferred from a goal alone:

1. **The goal.** The business outcome this metric (or tree of metrics) is meant to represent — not the metric itself, the actual thing that matters (retention, revenue quality, support quality).
2. **The behavior or decision it should drive.** What should a team do differently when this number moves? If nothing would change, the metric isn't earning its place.
3. **The owner.** Who is accountable for this number, and who else consumes it.
4. **Existing metrics to reconcile with.** Is there a metric already in use, on a dashboard, or reported externally, that this needs to match, replace, or coexist with? Read the codebase's existing metric definitions (dashboard queries, dbt models, a metrics README) before proposing a new one that quietly conflicts.

Ask what's missing with `AskUserQuestion`. Don't build the tree on a guessed-at goal.

## Act 2 — Build the metric tree

Structure top-down: the goal, then the primary (north star) metric that best represents it, then the driver/input metrics that feed the primary metric, then the guardrail metrics that catch the primary metric being gamed.

```mermaid
flowchart TD
    goal["Goal: <business outcome>"] --> primary["Primary metric: <north star>"]
    primary --> driver1["Driver metric 1"]
    primary --> driver2["Driver metric 2"]
    primary -.guardrail.-> guardrail1["Guardrail metric"]
```

A tree with no guardrail metric is a metric with no defense against being gamed — always propose at least one guardrail for the primary metric, even if it's provisional.

## Act 3 — Write the spec card, per metric

For every metric in the tree (primary, drivers, guardrails), fill this out:

- **Definition.** Plain-language sentence, then the formula.
- **Population, grain, time window.** Who's counted, at what unit, over what period, and how "this period" is bounded.
- **Attribution and exclusions.** How is credit assigned when multiple causes could apply (e.g., last-touch vs. first-touch)? What's explicitly excluded (test accounts, internal traffic, refunds) and why.
- **Source.** The table and field this reads from. If a repo is available, verify the source actually contains what the definition assumes — read the schema or the query that would compute it, don't take the name of a column on faith.
- **Direction and lag.** Is up good or bad? Is this a leading indicator (moves before the outcome) or a lagging one (confirms it after the fact)?
- **Expected variance.** What does normal week-to-week or day-to-day noise look like, so a real signal can be told apart from noise later.
- **Known gaming vectors.** How could someone move this number without moving the goal?

## Act 4 — Stress test each metric

Run these checks against every metric, especially the primary one:

- **Goodhart check.** If a team optimized only this number and ignored everything else, what would break? Name the concrete failure mode, not just "it could be gamed."
- **Sensitivity.** Does the metric actually move when the underlying behavior changes, or is it so smoothed, lagged, or aggregated that a real change wouldn't show up for months?
- **Attribution.** If this metric moves, can you tell *why* it moved, or does it conflate several causes into one number? A metric that can't be decomposed will trigger a `metric-investigation`-style root cause hunt every time it wobbles.
- **Mix-shift vulnerability.** Could the number move because the underlying population mix shifted (more of a low-value segment, fewer of a high-value one) rather than because behavior actually changed? See [analytics-traps.md](../analytics-guidelines/resources/analytics-traps.md) for how this shows up (Simpson's paradox).
- **Ratio vs. volume.** If it's a rate, is a rate really the right form, or does it hide a volume collapse (a steady conversion *rate* on a shrinking *base* looks fine and isn't)? Cross-check against [stats-pitfalls.md](../analytics-guidelines/resources/stats-pitfalls.md) for how ratio metric variance behaves at small denominators.

## Act 5 — Deliver

```
METRIC TREE
<mermaid diagram or indented list: goal -> primary -> drivers -> guardrails>

SPEC CARDS
### <Metric name>
- Definition: <plain language + formula>
- Population / grain / window: <...>
- Attribution / exclusions: <...>
- Source: <table.field, verified in <file> / not verifiable from this repo>
- Direction: <up is good/bad> · <leading/lagging>
- Expected variance: <...>
- Known gaming vectors: <...>

STRESS TEST
| Metric   | Goodhart risk | Sensitivity | Attribution | Mix-shift risk | Ratio vs volume |
|-----------|----------------|--------------|---------------|------------------|---------------------|
| <name>   | <finding>      | <finding>    | <finding>     | <finding>        | <finding>            |

THE WEAKEST METRIC
<one metric in the tree, named explicitly, with the single stress-test finding that makes
it the one to watch or fix before this ships>
```

Offer to save. Get today's date with `date +%F`. Use `docs/YYYY-MM-DD-metric-design-<descriptive-name>.md`, falling back to the repo root if there's no `docs/` folder. Ask before writing.

## Worked example

Goal given: *"We want a north star for whether our support team is actually helping customers, not just closing tickets fast."*

```
METRIC TREE
Goal: customers get real help from support
  -> Primary: issue resolved without reopening within 7 days (resolution rate)
     -> Driver: first-response time
     -> Driver: agent issue-type expertise match
     -> Guardrail: reopen rate within 7 days
     -> Guardrail: average handle time (catches rushing to close)

SPEC CARDS
### Resolution rate (primary)
- Definition: tickets closed and not reopened within 7 days / tickets closed, per week
- Population / grain / window: all customer-initiated tickets, excluding internal/test
  accounts, per closed ticket, rolling 7-day reopen window
- Attribution: a reopen counts against the agent who last closed it
- Source: tickets table, verified: `status_history` has a `reopened_at` field (checked
  in `schema/tickets.sql`)
- Direction: up is good · lagging (waits 7 days to confirm)
- Expected variance: ±3pp week to week on current volume
- Known gaming vectors: agents could close prematurely and let the customer re-file as a
  *new* ticket instead of reopening the old one — this metric alone wouldn't catch that

STRESS TEST
| Metric            | Goodhart risk                                   | Sensitivity | Attribution | Mix-shift risk                      | Ratio vs volume |
|--------------------|---------------------------------------------------|--------------|---------------|----------------------------------------|----------------------|
| Resolution rate    | premature close + re-file as new ticket evades it | good         | per-agent OK  | shifts if ticket-type mix changes      | rate hides volume drop |
| Reopen rate        | same evasion vector                              | good         | per-agent OK  | low                                    | fine at current volume |
| Avg handle time    | could be gamed by rushing simple tickets first    | good         | needs per-type breakout | shifts with ticket complexity mix | volume, not rate     |

THE WEAKEST METRIC
Resolution rate: the premature-close-and-re-file evasion isn't caught by any metric in
this tree yet. Add a guardrail counting tickets from the same customer on the same issue
within 14 days, regardless of whether the system marks it as a formal "reopen."
```

## Principles

- **A metric earns its place by surviving the stress test, not by having a clean formula.** A precise definition with no gaming check is half a spec.
- **Every primary metric needs at least one guardrail.** No exceptions — name a provisional one if nothing obvious exists yet.
- **Verify the source in code, not from the name of a column.** A field called `active_users` might count sessions, not users. Check.
- **Name the weakest metric explicitly.** A tree with five "looks fine" cards and no named weak point hasn't been stress-tested, it's been decorated.
- **Rates can hide volume collapse.** Always ask whether a ratio is masking a shrinking denominator.
- **Ask before saving.** The spec is the analyst's to keep or discard.
