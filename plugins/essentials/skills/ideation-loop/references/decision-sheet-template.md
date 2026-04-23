# Week {N} decision sheet

*Target: block 30 min. Fill every blank. Real design decisions get the time; confirmations tick through.*

## Decisions of record (summary)

Fill this table once the entries below are decided. Keep it at the top of the doc so a quick skim tells you what was locked.

| # | Decision | Call |
|---|---|---|
| 1 | {short label} | **{value}** |
| 2 | {short label} | **{value}** |

---

## 1. {One-sentence question}

**The question:** {what's being decided, plus the stake — why this matters and what it affects downstream. 1–2 sentences.}

**Alternatives, end-to-end:**

*Candidate: `name`*
- Repo / filename: {concrete}
- README line 1 / tagline: {one sentence a stranger sees first}
- Imports / CLI: `from name import …` · `name run stats`
- Public hook: "{LinkedIn or Substack opener this unlocks}"

*Candidate: `alt-name`*
- Repo / filename: {concrete}
- README line 1 / tagline:
- Imports / CLI:
- Public hook:

**My read:** {one paragraph — recommendation plus ONE conditional alternative. Format: "X if you want Y frame. Z if A-frame is closer."}

**Cost of being wrong:** {low / medium / high} — {concrete: rename = cheap? migration = 1 hr? lost stargazers?}

**Decision:** ______________________________

---

## 2. {One-sentence question}

**The question:**

**Alternatives, end-to-end:**

*Candidate: `name`*
- Repo / filename:
- README line 1 / tagline:
- Imports / CLI:
- Public hook:

*Candidate: `alt-name`*
- Repo / filename:
- README line 1 / tagline:
- Imports / CLI:
- Public hook:

**My read:**

**Cost of being wrong:**

**Decision:** ______________________________

---

# Quick confirmations (5 min, no real alternatives worth examining)

Use this section for decisions where a clear default exists and there's no reason to dissent. One line each.

## N. {Decision, recommendation stated}
{One-sentence rationale.} **Recommended yes.** ___

---

# How to run this sheet

Block 30 min. Fill every blank. Identify which entries are real design decisions (usually 3–5 per sheet) and spend the time there — everything else ticks through.

When you hit a decision you can't make fast, write down what additional info would unblock it. Don't stall; note it, move on, circle back.

Once all entries are answered, the next week starts clean.

---

# Retro (fill when the next loop revision begins, or after 4 weeks — whichever is first)

*Sheet date: {YYYY-MM-DD}. Retro date: {YYYY-MM-DD}.*

Fill in the five metrics. Targets are in brackets — flag anything outside the band.

- **Convergence rate** [target >80%]: {N decisions locked} / {N raised} = {%}
- **90-day reversal rate** [target <15%]: {list decisions reversed and when}; rate = {%}
- **Plan-to-commit lag** [target <7 days for v1 phases]: {days from this sheet's date to first commit against the locked decisions, or "N/A — no build phase yet"}
- **Worked-example completeness** [target >90%]: {N entries had all 4 slots} / {N entries} = {%}. Flag any that decayed into option lists.
- **Cost-of-being-wrong distribution** [target 30–60% medium-high]: low {N}, medium {N}, high {N}. Read: {one sentence — sheet was balanced / too ambitious / too easy}.

**One thing I'd change about how this sheet was run:** {free text, one sentence — this is the most useful field, don't skip it.}

**If plumb is online:** log each of the 5 as a `plumb.score` row with `scorer='retro'`, `scorer_version='manual-v1'`, `run_id={this sheet's slug}`. Metric names: `convergence_rate`, `reversal_rate_90d`, `plan_to_commit_lag_days`, `worked_example_completeness`, `cost_distribution_medium_high_pct`.
