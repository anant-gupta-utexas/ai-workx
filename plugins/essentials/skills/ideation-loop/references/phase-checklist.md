# Phase checklist

Quick reference: what to produce at each phase of the loop. Use when you're unsure what artifact comes next.

## Phase 1 — Reframe

**Signal to start:** user has N workstreams / buckets / ideas and no clear order; or user is cycling through framings without landing one.

**Produce:** one short doc (`prioritization.md`-style) with:
- A TL;DR at the top that names the collapsing move ("these 4 buckets are really 2 tracks")
- A table that reframes the original list into the collapsed form
- A one-paragraph "the insight" that explains *why* the collapse holds

**Done when:** the user can name the smallest true set of workstreams without consulting the doc.

**Skip this phase if:** the user has already reframed and only has decisions to make → jump to phase 3.

---

## Phase 2 — Canonical plan

**Signal to start:** the reframe is locked and the user needs a single doc of record for the project.

**Produce:** `{project}-plan.md` with:
- Thesis statement (1–3 sentences, survives the hiring-lens pitch test)
- What changed from any prior plan (bullet list with one-sentence deltas)
- Component table (what exists, public/private, role-family signal)
- Phase schedule (weeks, hour budgets, what ships each phase)
- A "what gates what" paragraph — which phase blocks which

**Done when:** the user can say "we're in phase X, gated on Y" without looking.

**Supersedes:** any prior plan doc. Move it to `archive/` and run phase 5.

---

## Phase 3 — Decision sheet

**Signal to start:** the plan is locked but K open questions are blocking the next phase.

**Produce:** `decisions-week{N}.md` using the decision-sheet-template. Rules:
- Each design decision gets the full 4-slot treatment (question, alternatives end-to-end, my read, cost of being wrong)
- Quick confirmations go in a second section with one line each
- The summary table at the top gets filled after decisions are made, not before

**Done when:** every blank is filled. Parked decisions have a note on what info would unblock them.

**Watch for:** if every entry scores medium-high cost-of-being-wrong, the sheet is too ambitious. Cut to 3 real decisions per sitting.

---

## Phase 4 — Topic split

**Signal to start:** the canonical plan exceeds ~300 lines, or covers 3+ topics that are starting to collide (e.g., schema design, orchestrator wiring, and scraping all in one doc).

**Produce:** per-topic owner docs. Each one owns its topic; the canonical plan keeps the phase schedule + gates but loses the deep topic content.

**Done when:** the `reference_workspace_docs.md` memory entry has a clean one-line answer for "where does topic X live?"

**Don't split prematurely:** splitting too early scatters context and makes the plan harder to hold in head. Wait until the omnibus doc is actually painful to navigate.

---

## Phase 5 — Archive + memory

**Signal to start:** phase 2 just produced a new canonical plan, or phase 4 just split a doc.

**Produce:**

1. Move superseded docs to `archive/`.
2. Append entries to `archive/README.md` using this shape:
   ```
   ### `{old-doc}.md` ({date})
   **Superseded by:** `../{new-doc}.md`
   {one line explaining what intent shifted}
   ```
3. Update memory (`reference_workspace_docs.md`) with the new doc-ownership map.
4. If any decisions from phase 3 are now locked, add them to project memory (not feedback).

**Done when:** a future conversation can read memory + archive README and reconstruct why the plan evolved.

---

## Phase 6 — Retro

**Signal to start:** phase 2 just produced a new canonical plan against the previous sheet, OR 4 weeks have elapsed since the previous sheet was completed, whichever is first.

**Produce:** fill the retro block at the bottom of the prior decision sheet. Read back the five metrics (convergence rate, 90-day reversal rate, plan-to-commit lag, worked-example completeness, cost-of-being-wrong distribution). If any is outside its target band, note the constraint — not as a rule for next time, as a signal.

**Done when:** the retro block is filled, including the "one thing I'd change" field. If plumb is online, metrics are logged as retro `scores` rows using the metric names in the template.

**Watch for:**
- Convergence rate <50% two sheets in a row → you're raising decisions that aren't yet decidable. Reframe first (go back to phase 1).
- 90-day reversal rate >30% → decisions are premature or candidates weren't rendered end-to-end. Check slot adherence in the sheet.
- Plan-to-commit lag >14 days → the stop rule should have fired earlier. Flag it to Anant explicitly.
- Worked-example completeness <80% → the skill itself is drifting. Revisit SKILL.md.

Don't over-index on a single sheet's metrics. A trend across 3+ sheets is the signal; one outlier is noise.

---

## The stop rule (applies across all phases)

If the user is about to start a third decision sheet without having shipped a commit against the plan: surface the tradeoff.

> "You've written {N} planning docs and 0 lines of {framework}. Walking skeleton first, or extending the planning phase — and if so, which phase slips?"

State the constraint, don't persuade. The user will self-cut.
