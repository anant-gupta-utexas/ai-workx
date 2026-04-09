---
description: Run ensemble peer review on a manuscript (5 independent reviews + meta-review as area chair)
argument-hint: <manuscript-path> | --reviews <N> | --format neurips | icml | workshop
---

Run an automated peer review on a manuscript, producing 5 independent reviews and a meta-review with a final decision.

## Arguments

- `<manuscript-path>` — Path to the manuscript (LaTeX or PDF). Default: `.autoresearch/manuscripts/draft-v1.tex`
- `--reviews <N>` — Number of independent reviews (default: 5)
- `--format <venue>` — Review format: `neurips`, `icml`, `workshop` (default: `neurips`)

## Step 1: Load Manuscript

Read the manuscript from the provided path. If it's a `.tex` file, read the LaTeX source directly. If it's a `.pdf`, note that full text extraction may be limited.

## Step 2: Individual Reviews

Run N independent review passes (default: 5). Each pass operates independently with no knowledge of other reviews.

**Reviewer Prompt:**
> "You are an AI researcher reviewing a paper submitted to a prestigious ML venue. Follow the [venue] reviewer guidelines. Provide a thorough, constructive review."

For each review, produce:

```json
{
  "review_id": "review-N",
  "summary": "2-3 sentence summary of the paper",
  "strengths": ["strength 1", "strength 2", "..."],
  "weaknesses": ["weakness 1", "weakness 2", "..."],
  "questions": ["question for authors"],
  "limitations_addressed": true/false,
  "ethical_concerns": "none / description",
  "scores": {
    "soundness": 1-4,
    "presentation": 1-4,
    "contribution": 1-4,
    "overall": 1-10,
    "confidence": 1-5
  },
  "decision": "strong_reject / reject / borderline_reject / weak_accept / accept / strong_accept"
}
```

Write each review to `.autoresearch/reviews/individual/review-N.json`.

### Venue-Specific Adjustments

**neurips / icml** (default):
- Full conference rigor required
- Novelty must be significant over prior work
- Comprehensive experiments expected
- Threshold for acceptance: overall >= 6

**workshop**:
- Lower novelty bar
- Negative results and interesting findings are welcome
- Shorter format acceptable
- Threshold for acceptance: overall >= 5.5

## Step 3: Meta-Review

After all individual reviews are complete, run a meta-review:

**Meta-Reviewer Prompt:**
> "You are an area chair at [venue]. You have received N reviews for a paper. Synthesize the reviews, resolve disagreements, and make a final recommendation."

The meta-review:
1. Reads all individual reviews
2. Identifies points of consensus (agreed strengths and weaknesses)
3. Resolves disagreements between reviewers
4. Weighs higher-confidence reviews more heavily
5. Produces a final recommendation

Write the meta-review to `.autoresearch/reviews/meta-review.json`.

## Step 4: Report

Generate a human-readable summary:

```
PEER REVIEW RESULTS
═══════════════════

Manuscript: [path]
Venue Format: [neurips / icml / workshop]
Reviews: N independent + 1 meta-review

Individual Scores:
  Review 1: Overall 6 (weak_accept)   Confidence: 4
  Review 2: Overall 7 (accept)        Confidence: 3
  Review 3: Overall 5 (borderline)    Confidence: 4
  Review 4: Overall 6 (weak_accept)   Confidence: 3
  Review 5: Overall 6 (weak_accept)   Confidence: 4

Aggregate:
  Overall:      6.0 / 10
  Soundness:    3.0 / 4
  Presentation: 2.8 / 4
  Contribution: 2.4 / 4
  Confidence:   3.6 / 5

FINAL DECISION: BORDERLINE

Consensus Strengths:
  - [strength agreed by majority]

Consensus Weaknesses:
  - [weakness agreed by majority]

Recommendation:
  [meta-reviewer's recommendation for the authors]
```

Also write `review-summary.md` to `.autoresearch/reviews/` for easy reading.

## Decision Thresholds

| Average Overall Score | Decision |
| --- | --- |
| >= 6.5 | ACCEPT |
| 5.0 - 6.49 | BORDERLINE |
| < 5.0 | REJECT |
