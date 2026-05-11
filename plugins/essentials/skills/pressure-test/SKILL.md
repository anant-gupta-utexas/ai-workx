---
name: pressure-test
description: Adversarial pressure-test for a claim, decision, or research conclusion. Use when the user says "pressure-test this", "grill this", "stress-test this decision", "what could go wrong", "challenge this claim", "find the falsifier", "what would prove this wrong", or "red-team this". Forces explicit evidence-tier classification, walks a five-mode failure scan, demands a falsifier in `Because-X-then-not-Y` form, and resolves to one of `holds / weakened / weakened-but-not-rejected / rejected / needs-evidence / unfalsifiable` plus a concrete next-step. Invoked by `ideation-loop` at convergence for decision-sheet entries with cost-of-being-wrong ≥ medium, and by `deep-research` at Verify for high-stakes briefs. Skip for low-stakes calls — over-invocation costs more than it saves.
---

# Pressure test

A standalone adversarial pass that turns a claim, decision, or conclusion into something with a named falsifier and an evidence tier. Generation is cheap; validation is the expensive half that doesn't have a native primitive in the stack until this skill ships. See [[probabilistic-engineering]] for the asymmetry argument.

## When to invoke

Use this skill when the user is in any of these states:

- **Convergence-time** (called from `ideation-loop`): a decision-sheet entry has cost-of-being-wrong ≥ medium and is about to be locked.
- **Verify-time** (called from `deep-research`): a brief is drafted and a load-bearing conclusion will be acted on, not just read.
- **Direct invocation**: the user names a claim, plan, or hypothesis and asks to grill / pressure-test / stress-test / falsify it.

Do NOT invoke for:

- Decision-sheet entries with cost-of-being-wrong = low. Pressure-testing a sub-1-hour-reversible decision costs more than it saves. The 10× rule from [[ten-x-impact-rule]] gates: if a 10× wrong call here would not produce 10× downside, skip.
- Build-time questions where the code answers faster than a rubric will.
- Pure information lookups — that's `web-research-specialist` territory.

### The stop rule

If the user invokes this on *every* entry of a decision sheet, surface that the gate has been violated:

> "You're pressure-testing all {N} entries. Only {K} score cost-of-being-wrong ≥ medium. The other {N-K} are sub-1-hour-reversible — running the rubric on them costs more than it saves. Want to pressure-test only the medium-high ones?"

State the constraint, don't persuade. See [[janky-first-principle]] — workflow ideas have a 20% hit rate, and skill over-invocation is the workflow-idea version of premature optimization.

## The anti-tooling-the-muscle clause

Do not invoke this skill cold on a claim the user has not yet examined themselves. Friction is the signal that System 2 is engaged — see [[craft-erosion-junior-engineers]]. The right shape is:

1. User attempts a failure-mode scan on their own claim, even briefly.
2. User notes what they think the weak spots are.
3. *Then* invoke `pressure-test` to either confirm the spots or surface ones the user missed.

If a user-attempted scan is absent, ask for it before running. One sentence per mode is enough — but it has to exist. Skipping this step turns the skill into a crutch that forecloses the user's own pattern-matching.

## The five-mode failure rubric

Walk these in order. One paragraph per mode. Each mode names a *specific* failure pattern with a *specific* catch.

### Mode 1 — Tier-5-dressed-as-Tier-2

The claim sounds clean but maps to weak evidence. Anecdote, single-case observation, or "I tried it once and it worked" presented with the confidence of a meta-analysis. See [[hierarchy-of-evidence]] for the 5-tier ladder (Tier 1: meta-analysis / systematic review; Tier 2: A/B or RCT; Tier 3: uncontrolled experiment; Tier 4: observational; Tier 5: anecdote / expert opinion / HiPPO).

**Catch:** Force explicit tier classification. State what tier the evidence actually is. If the claim's confidence outruns its tier, downgrade the claim or upgrade the evidence — don't paper over the gap.

### Mode 2 — Selection bias blind spots

The option set itself is the problem. Candidates that didn't make the sheet, populations that weren't sampled, alternatives that were dismissed before they were rendered end-to-end. The decision can be locally correct (best of the available options) and globally wrong (the right option wasn't on the menu).

**Catch:** Ask: who didn't show up? What candidate was rejected before it got the four-slot treatment? What population isn't represented in the evidence? If the answer is "nobody / none / I don't know," that's the failure mode firing.

### Mode 3 — Eval-aware target

The claim behaves differently when probed than when used. Common shapes: a benchmark that the system has been trained against; a metric that gets gamed once it becomes a target; a decision that holds in the review session but unravels in production. The validation environment doesn't match the deployment environment.

**Catch:** Ask: how does this claim behave when it doesn't know it's being measured? If the gap between "measured behavior" and "production behavior" can't be characterized, the claim isn't ready.

### Mode 4 — Domain drift

A general pattern is being applied to a specialist context, or vice versa. Confidently wrong where the model has thin training data. The shape that worked in domain A is being assumed to work in domain B without re-grounding.

**Catch:** Ask: is the evidence from the *same* domain as the decision? What's the closest analog the user has *actually* run, not the closest analog they've read about? If the only support is "this works in {adjacent field}," the analogy is doing more work than it should.

### Mode 5 — Verification/termination failure

The claim says it's done but the falsifier was not actually probed. Common shapes: the test passes but it doesn't test the thing; the brief reaches a conclusion but no source disagrees with it (so disagreement was never invited); the decision is "locked" but no concrete observation would unlock it. The verification step exists in form but not in substance.

**Catch:** Ask: what specifically was probed, and how do we know the probe was non-trivial? If a test exists, what would have to be different for it to fail? If a source review exists, what was the most credible contrary source and why was it dismissed?

## The falsifier

After the five-mode scan, demand a falsifier in this shape:

> **Because** {load-bearing belief}, **if** {specific observation occurs}, **then** {claim is weakened or rejected}.

The `Because` clause is the load-bearing piece — see [[hypothesis-if-by-will-because]]. Without an explicit `Because`, a failed observation is noise; with it, a failed observation is information.

If no falsifier exists — if there is no observation that would change the claim — say so plainly. The verdict is `unfalsifiable` and the next-step is to *make it falsifiable*, not to lock it.

## The verdict

End with exactly one of these resolutions:

| Verdict | When to use | Next-step shape |
|---|---|---|
| `holds` | Five-mode scan surfaces nothing load-bearing; falsifier is named and probed; evidence tier matches the claim's confidence. | Lock the claim. Move on. |
| `weakened` | Scan surfaces at least one mode firing; evidence tier is weaker than the claim's confidence implied. | Restate the claim at the tier the evidence supports. Re-lock. |
| `weakened-but-not-rejected` | The falsifier triggered, but the falsifier itself is rigid — a false-negative pattern from [[false-negative-agent-tests]]. The claim could still be valid even though one probe failed. | Add a second, less-rigid falsifier. Re-probe. Do not auto-reject. |
| `rejected` | Scan surfaces multiple modes firing; falsifier triggered cleanly; evidence does not survive contact. | Drop the claim. Surface the next-best candidate (or explicitly state there isn't one). |
| `needs-evidence` | Scan surfaces a mode firing but the `Because` clause is weak — the user can't say what would change their mind. | Name the specific evidence that would resolve the question. Defer the decision. |
| `unfalsifiable` | No observation would change the claim. | Make it falsifiable, or drop it as untestable. Do not lock. |

The verdict line carries the evidence tier explicitly. Example:

> **Verdict:** `weakened` (Tier 4 evidence — observational; original confidence implied Tier 2). Next: restate the claim as "in N observed cases X held" rather than "X holds generally," and either run an A/B if cheap or accept the weaker form.

## Output contract

Fixed 5-section order. Don't skip; if a section can't be filled, say what's missing and continue.

```markdown
## Pressure test: {one-sentence claim}

**1. Claim under test**
{The claim restated in precise, measurable terms. If the original was vague, sharpen it here.}

**2. Evidence tier**
Tier {1-5} — {one sentence on why this tier; what evidence is the claim leaning on?}

**3. Failure-mode scan**

*Tier-5-dressed-as-Tier-2:* {one paragraph; fires / does not fire / partial}

*Selection bias blind spots:* {one paragraph}

*Eval-aware target:* {one paragraph}

*Domain drift:* {one paragraph}

*Verification/termination failure:* {one paragraph}

**4. Falsifier**
Because {X}, if {Y observed}, then {Z — claim weakened/rejected}.
{Or: "No falsifier exists — claim is unfalsifiable in current form."}

**5. Cost-recalibration + Verdict**
Cost-of-being-wrong was rated {original}. Pressure-test surfaces: {recalibration — held / raised / lowered, with reason}.

**Verdict:** `{holds | weakened | weakened-but-not-rejected | rejected | needs-evidence | unfalsifiable}` (Tier {N} evidence).

**Next:** {one concrete next-step, ≤2 sentences}
```

## Composing with other skills

**From `ideation-loop`:** Invoked at convergence on decision-sheet entries with cost-of-being-wrong ≥ medium. The skill does not edit the decision sheet; it appends a pressure-test block below the entry. The user folds the recalibration back into the sheet's `Decision:` line.

**From `deep-research`:** Invoked at Verify (step 5) for conclusions that will be acted on, not just read. The verification log gains a "Pressure-test" section per load-bearing conclusion. Citation anchoring (URLs) and pressure-testing (falsifier + tier) are complementary, not redundant — the former proves sources exist; the latter proves the claim survives contact with the sources.

**Direct invocation:** No upstream context. Ask the user for the claim, attempt the user-side failure-mode scan (anti-tooling-the-muscle clause), then run.

## What this skill is not

- Not a red-team tool for attacking an adversary's argument. The target is the user's own claim — the skill exists to surface failure modes *before* a hiring manager / reviewer / collaborator surfaces them publicly.
- Not a substitute for running the actual experiment. If a falsifier is cheap to test (≤1 hr), run it instead of writing about it. See [[janky-first-principle]].
- Not for every decision. The 10× gate is strict. If the gate is removed, the skill becomes overhead.
- Not a steelman exercise. Steelmanning strengthens an opponent's argument; pressure-testing surfaces weaknesses in your own.

## References

- `references/failure-modes.md` — the five-mode rubric expanded with worked examples and edge cases. Load this when running the skill on a non-trivial claim.
