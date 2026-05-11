---
name: ideation-loop
description: Use whenever Anant starts, extends, or reframes planning work — framing a project, converging on open scope or design decisions, choosing among candidate names or architectures, rescoping a plan, or deciding what to build next. Triggers include "help me plan X", "decide between A and B", "force convergence", "scope this out", "too many open decisions", "what should I build first", or any cluster of undecided options where he's asking for a way forward. Also use when he has been ideating for multiple sessions without shipping — this skill has a stop rule that flags the drift. Produces planning artifacts (prioritization doc, canonical plan, decision sheet) in worked-example format where candidates are rendered end-to-end as concrete artifacts (repo names, README lines, imports, LinkedIn hooks) rather than abstract option lists, with cost-of-being-wrong calibration so Anant can self-cut. Invoke even when he doesn't ask for a "skill" — if he wants help deciding or planning, use this.
---

# Ideation loop

A five-phase pattern for moving from fuzzy intent to locked decisions in under 72 hours, built from what actually worked on the atlas + plumb planning push (April 2026). The load-bearing piece is the **decision-sheet entry format** — if you only take one thing from this skill, take that.

## When to invoke

Use this skill when the user is in any of these states:

- **Pre-plan:** "I have N buckets / workstreams / ideas and I don't know the order."
- **Pre-decide:** "Here are K open questions blocking Week J."
- **Post-drift:** An existing plan has shifted (positioning broadened, a component dropped) and the canonical doc is now stale.
- **Stuck between options:** The user is cycling between named alternatives without converging.

Do NOT invoke for:

- Pure research / information-gathering — use subagents, return findings with citations.
- Build-time decisions where the code answers faster than a doc will.
- Questions the canonical doc map already owns — check `reference_workspace_docs.md` in memory first, then point the user there instead of re-planning.

## The six phases

| Phase | Artifact | Purpose |
|---|---|---|
| 1. Reframe | Short TL;DR doc (`prioritization.md`-style) | Collapse N workstreams into the smallest true set. Before sequencing. |
| 2. Canonical plan | `{project}-plan.md` | One doc owns phase schedule + gating. Earlier plans move to `archive/`. |
| 3. Decision sheet | `decisions-week{N}.md` | Force convergence. Each open question gets candidates rendered end-to-end plus cost-of-being-wrong. |
| 4. Topic split | Per-topic owner docs | Once the plan is locked, each major topic gets its own doc. No more omnibus files. |
| 5. Archive + memory | `archive/README.md` + memory index | Every superseded doc gets one line: what replaced it, what shifted. |
| 6. Retro | Retro block at bottom of prior decision sheet | Fill the 5 metrics once the next plan revision lands. Log to plumb if available. |

Phases 1 → 3 typically run within one week. Phase 4 happens as topics earn their own doc (rule of thumb: >300 lines or ≥3 distinct subtopics). Phase 5 runs every time phase 2 produces a new canonical plan. Phase 6 fires on the *previous* sheet when a new loop revision begins, or after 4 weeks, whichever is first.

Phase 1 (reframe) is the judgment step — don't mechanize it. If the user asks you to reframe, propose one collapsing move, explain the frame, and let them push back. No balanced menus.

## The load-bearing primitive: the decision-sheet entry

This is the piece that forces convergence. Use this exact shape for every decision. Each slot does specific work — dropping one weakens the entry.

```markdown
## N. {One-sentence question}

**The question:** {what's being decided, with the stake — e.g., "this is the name on every import, every repo star, every LinkedIn hook"}

**Alternatives, end-to-end:**

*Candidate: `name`*
- Repo / filename: {concrete path}
- README line 1 / tagline: {the sentence a stranger sees first}
- Imports / CLI: `from name import …` · `name run stats`
- Public hook: "{the LinkedIn / Substack opener this unlocks}"

*Candidate: `alt-name`*
- {same four slots}

**My read:** {one paragraph — recommendation plus ONE conditional alternative. No three-way balanced comparison.}

**Cost of being wrong:** {low / medium / high} — {concrete: rename = cheap? migration = 1 hr? lost stargazers?}

**Decision:** ______________________________
```

### Why each slot is there

The **end-to-end artifacts** slot is the most important rule. "`atlas` vs `loom`" is an empty choice; `from atlas.orchestrator import run` beside a LinkedIn opener forces the user to feel which one they'd rather ship. If you render candidates as names-plus-blurbs, the sheet fails at its job.

The **public hook** slot catches candidates that look fine on paper but can't be explained to a recruiter in one sentence. Anant's positioning memory: everything feeds the plumb story / hiring lens. If a candidate has no clean hook, that's a signal to drop it or reframe.

The **"My read"** slot is one recommendation, not a menu. Anant's explicit feedback: "no 3-way option menus unless I explicitly ask." The recommendation leads; a conditional alternative is the one concession ("X if you want the map frame, Y if composing-components feels closer").

The **cost of being wrong** slot gates time spent. Low-cost decisions get ticked in 30 seconds; medium/high get the 30 minutes they deserve. This is Anant's scope-discipline rule applied to decisions: name the constraint, he self-cuts.

## Worked example (what a good entry looks like)

From `decisions-week3.md`, the one that actually worked:

```markdown
## 2. Measurement framework name

**The question:** one-word name for the keystone library. This is the name on every import, every repo star, every LinkedIn hook.

**Alternatives, end-to-end:**

*Candidate: `plumb`*
- Repo: github.com/anantgupta910/plumb
- README line 1: "plumb measures what agent telemetry tools don't:
  intervention, rework, routing, acceptance."
- Imports: `from plumb import run, score` · `plumb run stats --format json`
- LinkedIn: "plumb is the measurement framework I built because agentsview
  doesn't track whether a human actually accepted the agent's code."

*Candidate: `yardstick`*
- Repo: github.com/anantgupta910/yardstick
- README line 1: "yardstick is the measurement spine for multi-agent
  systems — four tables, ten metrics."
- Imports: `from yardstick import Run, Score` · `yardstick run list`
- LinkedIn: "yardstick ships today. Four tables. Ten metrics. Eight weeks
  of data on my own work to back it up."

**My read:** `plumb` if you want a verb-first name that implies *finding
what's true* (plumb line → ground truth). `yardstick` if the benchmark
frame is closer. Avoid names already on PyPI — check before committing.

**Cost of being wrong:** medium-high. Renaming costs every inbound link,
every stargazer, every DM. Spend 30 min here.
```

Notice what is NOT in there: no pros/cons bullet lists, no "Option A is good because X and bad because Y" balance, no three-way comparisons. Recommendation leads, alternative is conditional, cost-of-being-wrong tells the user how hard to think. If a draft entry you write looks more symmetrical than this, rewrite it.

## Calibrating cost of being wrong

| Tier | Marker | Examples |
|---|---|---|
| Low | Reversible in <1 hr, no external side effects | CLI flag names, test fixture layout, internal module split |
| Medium | Reversible in a day, minor external touch | Naming a private repo, picking initial judge model, choosing a starting framework |
| High | Hard to undo after launch — public links, published data, downstream dependencies | Public framework name, schema design, choice of provider once you've published numbers against it |

If every decision on the sheet scores "medium-high," something is wrong — either the sheet is too ambitious for one sitting, or the user is over-weighting reversibility. Push back once.

## Archive + memory protocol

When a canonical plan gets superseded:

Move the old doc into `archive/`. Append an entry to `archive/README.md`:

```markdown
### `{old-doc}.md` ({date})
**Superseded by:** `../{new-doc}.md`
{One-line explanation of what intent shifted — e.g., "First version used
DevEx-only positioning. The newer plan broadens to three role families and
reframes around measurement-as-flagship."}
```

Then update `reference_workspace_docs.md` in memory with the new ownership map.

The archive README serves two purposes: recoverability (the old doc isn't deleted, just demoted) and an audit trail of how the plan evolved. Future conversations can read it to understand what's been tried and why it changed. This matters because memory alone doesn't explain *why* a plan shifted — the archive does.

Locked decisions from the sheet go into project memory (e.g., `project_atlas_overview.md`), not feedback memory. Keep the distinction clean: feedback = how to work with Anant; project = what's true about the work.

## Adversarial pressure-test at convergence

Before locking any decision-sheet entry with cost-of-being-wrong ≥ medium, invoke the `pressure-test` skill on the entry. Skip for low-stakes entries — over-invocation costs more than it saves (see `pressure-test` SKILL.md for the stop rule and the 10× gate).

What pressure-test adds that the four-slot entry doesn't:

- **Evidence-tier classification** for the "My read" recommendation (Tier 1-5 from `[[hierarchy-of-evidence]]`). If the read is stated with Tier-2 confidence on Tier-5 evidence, the recommendation downgrades.
- **A named falsifier** in `Because-X-then-not-Y` shape. What specific observation would change the decision? If none exists, the entry isn't ready to lock.
- **A five-mode failure scan** (Tier mismatch, selection bias, eval-aware target, domain drift, verification/termination failure) that surfaces the failure modes a four-slot entry doesn't catch.

The pressure-test output appends a block under the entry; the user folds the cost-recalibration back into the `Cost of being wrong:` line and writes the falsifier alongside the `Decision:` line so a future reviewer can see what would unlock it.

## Scope discipline — the stop rule

This skill has a failure mode: it produces really good planning artifacts and zero code. Guard against it.

**Rule:** No third decision sheet before the first build-phase commit lands against the plan it's decisioning.

If the user asks for a third planning cycle with nothing shipped in between, surface the tradeoff explicitly: *"You've written {N} planning docs and 0 lines of {framework}. Want to ship a walking skeleton first, or are you intentionally extending the planning phase — and if so, which phase of the 12-week plan is absorbing the slip?"*

Don't persuade; state the tradeoff and let Anant self-cut. This mirrors his scope-discipline feedback memory.

## Hiring-lens filter

Every artifact this skill produces gets read through the hiring lens before it's final. The "Public hook" slot in each decision entry is the primary instance, but also apply it at the plan level:

- Does the canonical plan's thesis statement survive a 30-second pitch to a DevEx / AI-ML / agentic-systems hiring manager?
- Does every phase end in a shippable artifact a hiring manager could look at (repo, post, data)?
- If a component is in the plan but produces no public signal, name the cost explicitly and ask whether it stays.

Pure-tech rationale ("it's cleaner," "better separation of concerns") doesn't land. Ground every recommendation in candidate differentiation or scope tradeoff.

## Measuring the loop itself

The ideation loop is a measurement target, not just a process. Tracking these five over time tells you whether the loop is getting faster, more convergent, and more stable — or drifting into planning-as-avoidance.

| Metric | Definition | Signal it carries | Target |
|---|---|---|---|
| **Convergence rate** | decisions locked / decisions raised per sheet | Did the sheet actually close things, or leave them dangling? | >80% per sitting |
| **90-day reversal rate** | decisions reversed within 90 days / decisions locked | Stability — are the decisions holding after the sheet is put down? | <15% |
| **Plan-to-commit lag** | days from a canonical-plan revision to the first commit against it | Anti-drift — are you shipping against the plan or just re-planning? | <7 days for v1 phase plans |
| **Worked-example completeness** | entries with all 4 slots filled (question, end-to-end alternatives, my read, cost of being wrong) / total entries | Skill adherence — is the sheet doing its job, or decaying into option lists? | >90% |
| **Cost-of-being-wrong distribution** | % of entries rated medium-high | Sheet ambition — is the sitting trying to do too much at once? | 30–60% |

Each metric maps to a specific failure mode this skill is designed to prevent. If convergence rate drops below 50% two sheets in a row, you're raising questions that aren't yet decidable — reframe first. If reversal rate climbs above 30%, candidates weren't rendered end-to-end and the sheet is picking losers. If plan-to-commit lag exceeds 14 days, the stop rule should have fired earlier.

### How to capture (no new tooling)

The retro block at the bottom of `references/decision-sheet-template.md` has the five fields. Fill it when the next loop revision begins, or after 4 weeks — whichever comes first. This is a 5-minute retrospective pass, not a live dashboard.

### How to capture once plumb is online (Phase 1 Week 3 onward)

Emit each retro pass as five `scores` rows, same schema as your agent work:

```python
# pseudo-API; actual plumb surface may differ
plumb.score(run_id=sheet_id, metric="convergence_rate",
            scorer="retro", scorer_version="manual-v1",
            value=0.85)
plumb.score(run_id=sheet_id, metric="reversal_rate_90d",
            scorer="retro", scorer_version="manual-v1",
            value=0.10)
# ... etc
```

The hiring-lens upside: *meta-measurement*. You instrument your own planning process with the same framework you measure agent work with. "I measure my own ideation using the framework I shipped" is a cleaner LinkedIn hook than either piece standalone — and it's a dogfooding proof point when someone asks whether plumb generalizes beyond agents.

## Pairing with other skills

- **`anant-writing-style`:** Use it for any prose inside decision entries, especially the README line and Public hook slots. The worked example above already matches the voice — keep that register.
- **Memory system:** After a loop completes, update memory with (a) the new doc ownership map from phase 5, and (b) any locked decisions as project memory. Don't persist ephemeral session state.
- **`consolidate-memory`:** Run after phases 4 or 5 if the doc shuffle has left duplicate or stale entries in the memory index.

## References

- `references/decision-sheet-template.md` — blank fillable template ready to drop into a new week's decisions file.
- `references/phase-checklist.md` — quick checklist per phase; use when unsure what artifact to produce next.
