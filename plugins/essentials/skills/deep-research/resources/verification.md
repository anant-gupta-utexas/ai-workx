# Verification

The verification phase is a mandatory post-synthesis pass that ensures every claim in the research brief is source-grounded. It runs after the draft is complete and before delivery. Adapted from Feynman's Verifier agent pattern.

## When to Run

After the synthesis/draft phase completes and before final delivery. The verification pass is **not optional** — it is the quality gate between a draft and a deliverable.

## Citation Anchoring

Every factual claim in the brief must be linked to a source:

1. **Assign numeric IDs** to each unique source, starting from `[1]`
2. **Insert inline citations** immediately after the claim they support: "Transformers scale log-linearly with compute [1]."
3. **Build a unified Sources section** at the bottom of the brief with full details:

```markdown
## Sources

[1] Kaplan et al. "Scaling Laws for Neural Language Models." arXiv:2001.08361.
    https://arxiv.org/abs/2001.08361

[2] ...
```

4. **One source per claim minimum.** Claims supported by multiple sources get multiple citations: "Training loss follows a power law in model size [1][3]."

## URL Validation

For every URL in the Sources section:

1. **Fetch the URL** using WebFetch or WebSearch to confirm it resolves
2. **Check relevance** — the page content must actually support the specific claim it's cited for
3. **Handle failures:**
   - URL returns 404 or error: search for an alternative URL for the same source
   - URL is behind a paywall: note it as `[paywalled]` but keep if the claim is well-known
   - URL exists but doesn't support the claim: drop the citation and re-evaluate the claim

## Strength Sweep

Review every claim for evidence-strength alignment:

| Claim language | Required evidence level |
| --- | --- |
| "X is true" / "X causes Y" | Strong — multiple independent sources or a rigorous study |
| "X appears to" / "evidence suggests X" | Moderate — at least one credible source |
| "X may" / "some researchers believe X" | Weak — a single source or informed speculation |
| "It is widely accepted that X" | Strong — consensus across 3+ sources needed |

**Downgrade** any claim where the language is stronger than the evidence. For example:
- "LLMs understand language" -> "LLMs exhibit behavior consistent with language understanding [2]"
- "This approach is always better" -> "This approach outperformed alternatives in the tested benchmarks [3][5]"

## Pruning

Claims that fail verification must be handled:

| Situation | Action |
| --- | --- |
| No source found at all | Remove the claim entirely |
| Source found but doesn't fully support | Weaken the claim to match what the source actually says |
| Source is low-credibility (random blog, no citations) | Mark as `[unverified]` or replace with a better source |
| Claim is common knowledge (e.g., "Python is interpreted") | Keep without citation — but be conservative about what counts as common knowledge |

## Contradiction Detection

When sources disagree:

1. **Do not silently pick one side.** Present both positions.
2. **Structure the disagreement clearly:**

```markdown
There is disagreement on the optimal batch size for transformer training.
Source [2] reports that larger batch sizes (up to 2^20) improve convergence,
while Source [5] found diminishing returns above 2^17 and attributes the
difference to learning rate scaling methodology.
```

3. **Note the likely reason** for the disagreement if identifiable (different datasets, different metrics, different model scales, different publication dates).

## Verification Log

Write a verification log to `outputs/research/<slug>-verification.md`:

```markdown
# Verification Log: <topic>

**Date:** YYYY-MM-DD
**Draft:** <slug>-draft.md
**Brief:** <slug>-brief.md

## Summary
- Claims checked: N
- Fully verified: N
- Weakened: N
- Removed: N
- Contradictions flagged: N
- URLs validated: N/M (N live, M total)

## Claim-by-Claim

| # | Claim (abbreviated) | Source(s) | Status | Action taken |
| --- | --- | --- | --- | --- |
| 1 | "Scaling follows power law" | [1][3] | Verified | None |
| 2 | "MoE always outperforms dense" | [4] | Weakened | Changed to "MoE outperformed dense in tested configurations" |
| 3 | "Training is unstable above 1B" | none | Removed | No source found |

## URL Validation

| # | URL | Status | Notes |
| --- | --- | --- | --- |
| [1] | https://arxiv.org/abs/2001.08361 | Live | Confirmed |
| [2] | https://example.com/dead-link | 404 | Replaced with archived version |
```

## Checklist

Before marking verification as complete:

- [ ] Every factual claim has at least one `[N]` citation
- [ ] Every URL in Sources has been fetched and confirmed live
- [ ] No claim's language exceeds its evidence strength
- [ ] Contradictions between sources are explicitly flagged
- [ ] Verification log has been written
- [ ] Claims that couldn't be sourced have been removed or marked `[unverified]`
