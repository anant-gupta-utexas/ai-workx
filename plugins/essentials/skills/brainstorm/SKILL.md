---
name: brainstorm
description: Structured brainstorming that both unsticks and converges. Use when the user is stuck or going in circles on a problem (technical or not), has a sprawl of ideas or workstreams with no clear order, or is torn between options and needs a decision. Triggers include "I'm stuck", "blocked", "going in circles", "need a different perspective", "brainstorm this", "help me think through X", "decide between A and B", "too many options", "what should I do first", "scope this out", "force a decision". Diagnoses which state the user is in, then either applies one thinking persona (Contrarian, Hacker, Simplifier, Researcher, Architect) to generate new angles, collapses the option set into the smallest true set, or renders each candidate as a concrete artifact with one recommendation and a cost-of-being-wrong rating. Always ends in a concrete next action. Not for pure information lookups or bugs with a clear error and an obvious fix.
---

# Brainstorm

Brainstorming has two halves: **diverge** (find options you don't have yet) and **converge** (pick one). Most stalls come from running the wrong half — generating more options when the real need is a decision, or forcing a decision when no option is any good. This skill diagnoses which half is needed, runs it, and always ends in a concrete next action.

## Step 1: Diagnose the state

Read the conversation first. Ask only for what's missing: what the problem is, what's been tried, what happens when it's tried, and what's at stake.

| State | Signals | Mode |
|---|---|---|
| **Stuck** | No workable option. Same approach repeated, fixes undo each other, "nothing works" | Diverge |
| **Sprawling** | Many ideas or workstreams, no order. "Where do I start?", "I have N things going" | Reframe |
| **Torn** | Two or more viable options, no decision. Cycling between them, "A or B?" | Converge |

If the state is ambiguous, state your read in one sentence and ask the user to confirm. Modes chain: Diverge often produces options that then need Converge; Reframe often leaves a short list of open choices for Converge.

## Mode: Diverge

Classify why the user is stuck, then load **exactly one** persona:

| Stagnation pattern | Signals | Persona |
|---|---|---|
| Spinning | Same approach, same result, "I keep trying X but…" | Contrarian |
| Assumption lock-in | "We have to…", constraints never questioned | Contrarian |
| Unknown cause | Trying fixes without understanding the problem; behavior contradicts expectations; arguing from opinion, not evidence | Researcher |
| Oscillation | Bouncing between two approaches, each breaking what the other fixed | Architect |
| Complexity trap / diminishing returns | Too complex to reason about; each gain smaller than the last | Simplifier |
| Blocked by "the right way" | The proper solution is too expensive, slow, or big | Hacker |

If unclear, default to **Hacker** — questioning which constraints are real works across every pattern.

Read the persona file from `references/personas/`, then:

1. Reframe the problem using the persona's core question.
2. Walk the persona's method step by step, applied to the user's specific situation.
3. Propose one concrete next action — ideally an experiment that takes 30 minutes or less.
4. Check in. If the reframing doesn't land, offer a different persona. The user can also name one directly ("try the contrarian angle").

## Mode: Reframe

Propose **one** collapsing move: "these N items are really K tracks, because…". Show the original list mapped to the collapsed form in a small table, followed by one paragraph on why the collapse holds.

This is a judgment call — make it, don't mechanize it. Don't offer a balanced menu of framings; make one call and let the user push back.

Done when the user can name the smallest true set without looking at the table. If what remains is a set of open choices, move to Converge.

## Mode: Converge

Each open decision gets one entry in this shape. Every slot does work; dropping one weakens the entry.

```markdown
## N. {One-sentence question}

**The question:** {what's being decided, plus the stake — what it touches downstream}

**Alternatives, rendered concretely:**

*Candidate: {name}*
- Concrete form: {what it literally is — name, file path, service, API, plan step}
- First impression: {what someone sees first — README line, UI, config diff, opening sentence}
- Day-to-day use: {how it's actually used or lived with — import, command, workflow, recurring cost}
- One-sentence pitch: {how you'd explain this choice to someone outside the work}

*Candidate: {alt-name}*
- {same four slots}

**My read:** {one recommendation plus at most ONE conditional alternative}

**Cost of being wrong:** {low / medium / high} — {concrete: what undoing it costs}

**Decision:** ______________________________
```

**Render candidates concretely.** This is the most important rule. "Postgres vs Redis" is an empty choice; `@app.task` on a function next to "two more containers in `docker-compose.yml`" lets the user feel which one they'd rather live with. Adapt the four slots to the domain, but never render a candidate as a name plus adjectives.

**The pitch slot is a filter.** If a candidate can't be explained in one sentence to someone outside the work, drop it or reframe it.

**One recommendation, not a menu.** No pros/cons lists, no three-way balanced comparisons unless the user explicitly asks. Lead with the recommendation; the conditional alternative is the one concession ("X, unless you expect Y — then Z").

### Example entry

```markdown
## 1. Where should background jobs run?

**The question:** queue backend for the API's background jobs. This adds infrastructure the team runs, monitors, and gets paged on.

**Alternatives, rendered concretely:**

*Candidate: Postgres-backed queue (procrastinate)*
- Concrete form: a jobs table in the existing database; workers run as `procrastinate worker`
- First impression: no new service in `docker-compose.yml`
- Day-to-day use: `@app.task` on a function; inspect jobs with a SQL query
- One-sentence pitch: "Jobs ride on the database we already back up and monitor."

*Candidate: Redis + Celery*
- Concrete form: a new Redis service plus Celery worker and beat processes
- First impression: two more containers and a broker URL in config
- Day-to-day use: `@shared_task`; inspect with Flower
- One-sentence pitch: "The standard Python queue, built for high throughput."

**My read:** Postgres queue — volume is hundreds of jobs per hour, and one fewer service beats throughput headroom nobody needs yet. Celery if you expect sustained load above ~100 jobs per second within a year.

**Cost of being wrong:** medium — jobs sit behind one interface; swapping is about a day of work plus draining in-flight jobs.

**Decision:** ______________________________
```

Notice what's absent: no pros/cons bullets, no symmetry. If a draft entry looks more balanced than this, rewrite it.

### Calibrating cost of being wrong

The rating tells the user how long to think: low-cost entries get ticked in 30 seconds, high-cost ones get the time they deserve.

| Tier | Marker | Examples |
|---|---|---|
| Low | Reversible in under an hour, no external side effects | CLI flag names, internal module split, test fixture layout |
| Medium | Reversible in about a day, minor external touch | Choice of library, private service name, initial vendor or model choice |
| High | Hard to undo once others depend on it | Public names, schemas, published APIs, anything with data or users downstream |

If every entry rates medium or high, either the sitting is too ambitious or reversibility is being over-weighted. Push back once.

### Several decisions at once

When there are more than two decisions, use `references/decision-sheet-template.md`. Keep it to 3–5 real decisions per sitting; anything with an obvious default goes in the one-line quick-confirmations section. If a decision can't be made, write down what information would unblock it and move on.

### Pressure-testing before locking

For high-cost entries (or medium, if the user wants), run the `pressure-test` skill on the entry before locking it, if it's installed. Skip it for low-cost entries — the rubric costs more than it saves there.

## Stop rule

Brainstorming can turn into a way of avoiding the work. If the user starts a third round of brainstorming or decisions on the same problem without having acted on the previous round (built, tested, shipped, or tried anything), state the tradeoff once:

> "That's {N} rounds of decisions with nothing tried yet. Run the smallest experiment first, or keep planning on purpose?"

State the constraint; don't persuade. The user decides.

## Rules across all modes

- End with a concrete next action. Never leave the user with only questions.
- Respect hard constraints (security, legal, physics, contractual). Everything else is negotiable.
- Don't dismiss prior work — the goal is a better path, not a critique.
- Skip this skill for pure information lookups, bugs with a clear error and an obvious fix, and decisions the code answers faster than a discussion would.

## References

- `references/personas/` — one file per Diverge persona (`contrarian.md`, `hacker.md`, `simplifier.md`, `researcher.md`, `architect.md`). Load only the one selected.
- `references/decision-sheet-template.md` — fillable sheet for converging on several decisions in one sitting.
