# Failure modes — expanded rubric

The five modes from SKILL.md, expanded with worked examples, edge cases, and the specific catch patterns that distinguish a mode firing from a mode misfiring. Load this when running pressure-test on a non-trivial claim — the SKILL.md summaries are enough for routine passes, but ambiguous cases need this file.

The modes are not mutually exclusive. A claim can fire on two or three modes simultaneously; surface all of them. Don't pick one and stop.

---

## Mode 1 — Tier-5-dressed-as-Tier-2

### What the mode actually catches

A confidence/evidence mismatch. The claim is stated with the certainty of high-tier evidence, but the support is low-tier. The five tiers, from strongest to weakest:

| Tier | Shape | Typical support |
|---|---|---|
| 1 | Meta-analysis / systematic review | Aggregated A/Bs across N studies |
| 2 | A/B test or RCT | Controlled comparison, one study |
| 3 | Uncontrolled experiment | Pre/post on one system, no control |
| 4 | Observational | "I noticed X correlates with Y" |
| 5 | Anecdote / expert opinion / HiPPO | "It worked for me," "X said so" |

Confidence words that don't survive low-tier evidence: "always," "every time," "the right call," "we know," "obviously," "proven."

### When it fires

- Claim: "Adding more agents to a workflow degrades quality." Evidence: one team's experience with one workflow. **Tier 5 dressed as Tier 1.** Fires.
- Claim: "TypeScript catches 80% of bugs at compile time." Evidence: one paper, one codebase. **Tier 3 dressed as Tier 1.** Fires (the 80% is precise, the support is not).
- Claim: "I find that breaking up large PRs makes review faster." Evidence: own experience. **Tier 5, stated as Tier 5.** Does not fire — the confidence matches the support.

### When it misfires

- Claim is explicitly hedged ("in my experience," "for the systems I've worked on") and the hedge is load-bearing in the prose. Don't downgrade hedged claims to fire this mode.
- Claim is a value statement, not a factual one ("I prefer X to Y"). Tier classification doesn't apply.

### Catch pattern

Force the user to state the tier explicitly. Then ask: does the claim's confidence outrun the tier? If yes, the fix is to either downgrade the claim ("in my experience X holds") or upgrade the evidence (run an A/B, find a meta-analysis, cite an RCT). Both fixes are legitimate. The fix that's *not* legitimate is leaving the gap.

---

## Mode 2 — Selection bias blind spots

### What the mode actually catches

The set of options under consideration is itself biased. Candidates that didn't make the decision sheet, populations that weren't sampled, alternatives that were dismissed before they got the end-to-end treatment. The decision can be locally correct (best of the rendered options) and globally wrong (the right option was never rendered).

This is distinct from "the chosen option is wrong." This mode is upstream of the choice — it questions whether the *menu* is correct.

### When it fires

- Decision sheet entry: "Pick `plumb` vs `yardstick` for the framework name." Mode fires if a name like `inkblot` or `groundtruth` was dismissed in 30 seconds without being rendered end-to-end. The fast-dismissal is the bias — the user didn't pay the cost to actually see the rejected name beside the kept ones.
- Research brief: "These three frameworks are the leading agent measurement tools." Mode fires if the brief sampled GitHub stars and didn't sample academic citations or industry adoption. The selection-method itself filtered the candidate set.
- Hiring decision: "These three candidates are the top of the pile." Mode fires if the JD's language filtered out qualified people who didn't recognize their own match.

### When it misfires

- The user *did* render rejected candidates end-to-end and they were genuinely worse on every slot. That's evidence, not bias.
- The decision is genuinely small-stakes and the cost of widening the menu exceeds the value of finding a better option. Mode 2 has a cost gate too: don't fire it on cost-of-being-wrong = low decisions.

### Catch pattern

Ask three questions, in order:

1. **Who didn't show up?** Name a candidate or population that was dismissed before the decision sheet. If the user can't, that's the failure firing.
2. **Why didn't they show up?** Was it cost-of-rendering, prior knowledge, default templates, or something structural? The reason tells you whether to widen the menu.
3. **What's the cost of widening?** If the cost is sub-1-hr and the decision is medium-high stakes, widen. If the cost is days and the decision is low-stakes, don't.

---

## Mode 3 — Eval-aware target

### What the mode actually catches

The claim behaves differently when it knows it's being measured than when it doesn't. The validation environment doesn't match the deployment environment. Goodhart's law in miniature.

Common shapes:

- A benchmark the system was trained against (memorization, not generalization).
- A metric that gets gamed once it becomes a target (PR count rises, code quality falls).
- A decision that holds in the review session but unravels in production because the review setup was artificial.
- A claim that holds when the user actively sustains it but degrades the moment they stop paying attention.

### When it fires

- Claim: "This agent has 95% success on the test suite." Mode fires if the test suite was generated by the same model that's being measured, or if the suite was selected to play to the agent's strengths.
- Claim: "I'll commit code daily" as a personal-OS measurement target. Mode fires the moment "commit daily" becomes a metric — the user starts shipping trivial commits to keep the streak.
- Claim: "This deploy gate catches regressions." Mode fires if the gate is configured by the same team that writes the code being gated; the gate evolves to not block the team's existing patterns.

### When it misfires

- The evaluator and the target are structurally independent. A third-party benchmark with no information leakage doesn't fire this mode.
- The metric is genuinely uncoupled from the user's incentive structure. "Time spent on email per day" doesn't fire because the user doesn't have an incentive to game it.

### Catch pattern

Ask: how does the claim behave when the target doesn't know it's being measured? Two operationalizations:

1. **Held-out probe** — does the claim hold on data the system has never seen and the user has never tuned against?
2. **Behavior in the absence of metric** — does the user behave the same way when no one is logging the metric?

If the gap between measured-behavior and unobserved-behavior is wide, the claim is eval-aware and the verdict should reflect that.

---

## Mode 4 — Domain drift

### What the mode actually catches

A pattern from one domain is being applied to another without re-grounding. The shape that worked in domain A is being assumed to work in domain B because they look similar — but the underlying mechanics are different.

This is most common at the boundary between general patterns (e.g., from a book, a paper, a Twitter thread) and specialist contexts (e.g., the user's specific codebase, team, market, agent system).

### When it fires

- Claim: "Move fast and break things works for our team." Mode fires if "us" is a 3-person consulting firm and the pattern is from Facebook's 2010 product velocity.
- Claim: "Adding more tools to the agent improves performance." Mode fires if the supporting evidence is from frontier-lab agents and the user's agent runs on smaller models that handle tools differently.
- Claim: "Stanford found AI raises productivity 14%." Mode fires if the user is applying this to *their solo work* — the Stanford study was 350-person teams with managers, code review, and shared codebases.

### When it misfires

- The general pattern is being *cited as a starting hypothesis*, not adopted as a conclusion. "Stanford found X; let me check whether X holds for me" is correct epistemics, not domain drift.
- The domains are structurally identical, not just superficially similar. Pattern transfer between two similar Python codebases isn't drift.

### Catch pattern

Ask: is the evidence from the *same* domain as the decision? Then sharpen:

1. **What's the closest analog the user has actually run, not the closest analog they've read about?** If the only support is "this works in {adjacent field}," the analogy is doing more work than it should.
2. **What would have to be different about the user's domain for the pattern to not transfer?** If the user can name those conditions and they're absent in their domain, the analogy is fine. If they can't, the transfer is unsafe.

---

## Mode 5 — Verification/termination failure

### What the mode actually catches

The claim says it's verified, but the falsifier was not actually probed. The verification step exists in form but not in substance. This is the most subtle mode — it doesn't catch claims with no verification; it catches claims with *ceremonial* verification.

Common shapes:

- A test exists but doesn't test the thing. The test passes; the system still fails on the same shape of input.
- A brief reaches a conclusion but no source disagrees with it. Either disagreement was never invited (curated source set) or contrary sources were dismissed without engagement.
- A decision is "locked" but no concrete observation would unlock it. The verification ritual completed without the verification *happening*.

### When it fires

- Claim: "I reviewed three contrary takes and they don't hold up." Mode fires if the three contrary takes were the weakest steelmen the user could find. Verification was selection-biased.
- Claim: "We have 90% test coverage on this module." Mode fires if the tests are coverage-shaped (line-touching) rather than property-shaped (behavior-verifying).
- Claim: "The decision sheet was pressure-tested." Mode fires if the pressure-test was done in 30 seconds per entry — the ritual happened but the probe was too shallow to surface anything.

This mode is recursive: pressure-test itself can fire Mode 5. A ceremonial pressure-test is worse than no pressure-test, because it banks confidence without earning it.

### When it misfires

- The user has explicitly invited disagreement (a real reviewer, a real adversarial test, a real production rollout) and the disagreement was substantive but the claim survived. That's verification working.
- The user has named the falsifier and probed it non-trivially, and the falsifier didn't trigger. That's also verification working — even if the probe was the only one available.

### Catch pattern

Ask three questions, in order:

1. **What specifically was probed?** Name the test, the source, the reviewer, the production case. Not "we reviewed it" — what got reviewed.
2. **How do we know the probe was non-trivial?** Could the probe have surfaced a problem that didn't exist before? If the answer is "no, the probe would always pass," the verification was ceremonial.
3. **What was the most credible contrary signal and why was it dismissed?** If no contrary signal exists, either the claim is rock-solid or the search was biased. Almost always the latter.

---

## Composing modes — common firing patterns

Modes are not mutually exclusive. Common multi-mode patterns:

- **1 + 4 (overconfident transfer):** Tier-5 evidence from one domain stated as Tier-1 in another. "X works for top teams, so it'll work for us." Tier mismatch + domain drift.
- **2 + 5 (selection-biased verification):** The verification step is real, but the verifier set was hand-picked. The brief reviewed three sources, all friendly. Selection bias + ceremonial verification.
- **3 + 5 (eval-aware ceremony):** The test exists, the system passes, but the test was written by the team that built the system. Eval-aware target + ceremonial verification.

When two or more modes fire, the verdict should be at least `weakened`, not `holds`. If three or more fire on a single claim, `rejected` is the usual outcome unless the falsifier explicitly survives.

---

## The user-side scan that must happen first

Before invoking this rubric, ask the user to attempt their own scan, even briefly. One sentence per mode is enough. If the user's scan is missing, request it before running.

The point isn't gatekeeping — it's that running the rubric cold on a claim the user hasn't examined themselves shortcuts the formation of the user's own taste. The skill exists to surface modes the user *missed*, not to replace the act of looking.
