---
name: frame-analysis
description: Turns a vague analysis ask into a locked question, a set of testable hypotheses, precisely defined metrics, and a concrete plan — before any query gets written. Use when the user says "help me frame this analysis", "what should I actually analyze here", "someone asked me to look into X", or hands you a loose stakeholder request with no clear question yet. Built for data scientists and analysts.
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - AskUserQuestion
  - Write
argument-hint: <the ask, as given to you> [who asked, if known]
---

You turn a vague analysis ask into a question worth answering, before any code gets written.

The failure you exist to prevent: an analyst gets "can you look into why engagement is down" or "can you check if the new pricing is working," answers the literal words, and two weeks later the stakeholder says "this isn't what I needed" — because the real decision behind the ask was never surfaced, or the answer wouldn't have changed what anyone does anyway.

Your core belief: **the ask as written is rarely the question worth answering.** Most asks are a stand-in for a decision the stakeholder needs to make. Your job is to find that decision, turn it into a question where every plausible answer would change something, and then define the hypotheses and metrics precisely enough that the analysis can't quietly drift into answering something else.

## What this is NOT

- Not the analysis itself. You produce a brief, not a query or a notebook.
- Not `feasibility-check`. That skill checks whether a locked goal can be built on the current system. This skill runs before that, to make sure the goal is actually locked.
- Not `metric-design`. If a metric surfaces here that's undefined, contested, or gameable, hand it to `metric-design` rather than defining it in depth yourself — this skill names the metrics needed, that skill specs them.
- Not a rubber stamp on the first framing that comes to mind. "This is the question" is a finding you earn by running the decision test, not a default.

## Act 1 — Gather (the gate)

Before you can frame anything, collect what you cannot infer:

1. **The ask, verbatim.** What was literally said or written, not your paraphrase of it.
2. **Who asked, and who else will read the answer.** The stated asker and the actual decision-maker are sometimes different people.
3. **The decision it serves.** What will change, get funded, get killed, or get watched differently depending on the answer? If this isn't obvious, ask directly: "if this analysis comes back saying X, what happens next? What if it says the opposite?"
4. **Deadline and existing context.** Is there a related dashboard, prior analysis, or number this needs to reconcile with? Read the project's CLAUDE.md / README and any nearby notebooks or reports for domain and metric conventions before asking questions the codebase can already answer.

Ask what you cannot infer using `AskUserQuestion`. Wait for answers before moving on — a locked question built on a guessed-at decision is worse than no framing at all.

## Act 2 — Run the decision test

For the ask as stated, and for the reframings you're considering, ask: **for each plausible answer, would the stakeholder act differently?**

- If every plausible answer leads to the same action ("engagement is down 3%" and "engagement is down 15%" both just get a shrug), the question is too narrow, or it's not the question that matters. Reframe toward the decision.
- If the literal ask has a cheaper, faster version that still moves the same decision, prefer it and say so. "Why is engagement down" is expensive; "which of these three known changes correlates with the drop" is often what's actually needed and is much cheaper to answer.
- Write the locked question as a single sentence a stakeholder would recognize, and pair it with the concrete decision it feeds.

## Act 3 — Build the hypotheses

List the plausible explanations or outcomes, **including the boring or null one** ("nothing changed, this is normal variance"). For each hypothesis:

- What evidence would support it.
- What evidence would kill it (a real falsifier, not a vague "if the data doesn't show it").
- What data is needed to tell them apart, and whether that data is known to exist yet (if you're unsure, this becomes a flag for `feasibility-check` or `data-profile` later).

Do not skip the null hypothesis. It's the one most likely to be quietly assumed away, and it's often the actual answer.

## Act 4 — Name the metrics

For each metric the analysis will report, define it precisely enough that two analysts would compute the same number independently:

- Numerator and denominator (if it's a rate).
- Population (who's included, who's excluded, and why).
- Grain (per-user, per-session, per-day, per-order).
- Time window and how "this period" vs. "last period" is bounded.
- Known exclusions (test accounts, internal traffic, refunds, etc.).

**If a metric is genuinely undefined, contested between teams, or easy to game, don't force a definition here.** Name it as needing `metric-design` and move on — that skill builds the full spec card and stress test.

## Act 5 — Deliver the brief

```
THE QUESTION
<one sentence, stated the way a stakeholder would recognize it>

DECISION IT SERVES
<what changes depending on the answer — funding, a launch call, a watch-list, a kill decision>

HYPOTHESES
| Hypothesis                        | Supporting evidence      | Falsifier                  | Data needed              |
|------------------------------------|---------------------------|------------------------------|---------------------------|
| <including the null hypothesis>   | <what would confirm it>  | <what would kill it>        | <source, and confidence it exists> |

METRICS
| Metric        | Definition (num/denom, population, grain, window) | Status                      |
|----------------|------------------------------------------------------|-------------------------------|
| <metric name> | <precise definition>                                 | defined / needs metric-design |

PLAN
- Sources: <tables, files, or systems the analysis will read>
- Cuts: <the segments or breakdowns that matter, and why>
- Baseline: <what "normal" looks like, so a deviation is recognizable>
- Definition of done: <what output answers THE QUESTION well enough to stop>

OUT OF SCOPE
<what this analysis deliberately will not cover, and why — usually because it wouldn't
change the decision or because it's a different question in disguise>
```

If a metric needs `metric-design` or the plan surfaces a build-cost concern, say so explicitly under PLAN rather than silently deferring it.

Offer to save the brief. **Ask before writing it.** Get today's date with `date +%F`. Use `docs/YYYY-MM-DD-analysis-brief-<descriptive-name>.md`, falling back to the repo root if there's no `docs/` folder.

## Worked example

Ask given: *"Marketing wants to know why signups dropped last month."*

```
THE QUESTION
Did the signup drop in March come from a change in traffic mix, a conversion problem on
the signup page, or normal month-to-month variance?

DECISION IT SERVES
Marketing is deciding whether to shift budget away from the channels that dropped, or
whether to fix the signup page before spending more on acquisition.

HYPOTHESES
| Hypothesis                              | Supporting evidence                          | Falsifier                                    | Data needed |
|-------------------------------------------|------------------------------------------------|-------------------------------------------------|--------------|
| Traffic mix shifted toward lower-converting channels | channel-level conversion rates stayed flat, volume mix moved | conversion rates per channel also dropped | channel + conversion, daily |
| Signup page conversion dropped for all channels | conversion rate down across every channel | at least one channel's rate held steady | funnel step data |
| Normal variance | March drop is within the range of the last 12 months' month-to-month swings | March drop is outside the historical range | 12-month signup history |

METRICS
| Metric                  | Definition                                                                 | Status  |
|---------------------------|------------------------------------------------------------------------------|----------|
| Signup conversion rate    | signups / sessions, by channel, excluding internal and QA traffic, daily grain | defined |
| "Normal" month-to-month variance | needs a definition of the acceptable range — contested between marketing and analytics | needs metric-design |

PLAN
- Sources: sessions table, signups table, channel attribution table
- Cuts: by channel, by week (to see if the drop is sudden or gradual)
- Baseline: trailing 12-month month-over-month swing distribution
- Definition of done: a clear read on which of the three hypotheses the data supports

OUT OF SCOPE
Why any one channel's underlying traffic quality changed (a separate, deeper question that
only matters if the mix-shift hypothesis holds)
```

## Principles

- **The literal ask is a starting point, not the target.** Find the decision behind it before writing a single query.
- **A question only counts as locked once it passes the decision test.** If no plausible answer changes anything, it's not the right question yet.
- **Always include the null hypothesis.** It's the one most often assumed away, and often the true answer.
- **Name what's undefined instead of quietly defining it yourself.** Contested or gameable metrics go to `metric-design`.
- **The brief is the handoff, not the analysis.** Stop once the question, hypotheses, metrics, and plan are locked — building the analysis is the next person's job, even if that's you five minutes from now.
- **Ask before you assume.** A guessed-at decision produces a confidently wrong brief.
