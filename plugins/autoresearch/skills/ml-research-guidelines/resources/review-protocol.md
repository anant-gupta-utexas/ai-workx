# Review Protocol

Ensemble peer review process: 5 independent reviews + meta-review aggregation, modeled after the AI Scientist's Automated Reviewer.

## Overview

The review protocol evaluates a generated manuscript using an ensemble of 5 independent review passes followed by a meta-review. This mimics the peer review process at ML conferences (NeurIPS, ICML, ICLR), providing structured feedback on scientific quality.

## Review Process

### Step 1: Individual Reviews (5 passes)

Each review pass operates independently, producing a structured assessment:

**Reviewer Role Prompt:**
> "You are an AI researcher reviewing a paper submitted to a prestigious ML venue. Follow the NeurIPS reviewer guidelines."

**Review Output Structure:**

```json
{
  "review_id": "review-3",
  "summary": "This paper proposes...",
  "strengths": [
    "Clear experimental methodology with reproducible results",
    "Novel finding that model width matters more than hyperparameter tuning"
  ],
  "weaknesses": [
    "Limited to single-GPU training regime",
    "No comparison with established architecture search methods"
  ],
  "questions": [
    "How would results change with a longer training budget?",
    "Was the attention pattern choice validated on other datasets?"
  ],
  "limitations_addressed": true,
  "ethical_concerns": "None identified",
  "scores": {
    "soundness": 3,
    "presentation": 3,
    "contribution": 2,
    "overall": 6,
    "confidence": 4
  },
  "decision": "weak_accept"
}
```

### Score Scales

| Dimension | Scale | Anchors |
| --- | --- | --- |
| Soundness | 1-4 | 1=poor, 2=fair, 3=good, 4=excellent |
| Presentation | 1-4 | 1=poor, 2=fair, 3=good, 4=excellent |
| Contribution | 1-4 | 1=poor, 2=fair, 3=good, 4=excellent |
| Overall | 1-10 | 1=strong reject, 5=borderline, 7=accept, 10=strong accept |
| Confidence | 1-5 | 1=low, 3=moderate, 5=expert |

### Decision Mapping

| Overall Score | Decision |
| --- | --- |
| 1-3 | strong_reject |
| 4 | reject |
| 5 | borderline_reject |
| 6 | weak_accept |
| 7 | accept |
| 8-10 | strong_accept |

### Step 2: Meta-Review

After all 5 individual reviews are complete, a meta-review aggregates them:

**Meta-Reviewer Role:**
> "You are an area chair at a top ML conference. You have received 5 reviews for a paper. Synthesize the reviews into a final recommendation."

**Meta-Review Process:**

1. Read all 5 individual reviews
2. Identify consensus points (agreed strengths/weaknesses)
3. Resolve disagreements between reviewers
4. Weigh higher-confidence reviews more heavily
5. Produce a final recommendation

**Meta-Review Output:**

```json
{
  "meta_review_summary": "The reviewers generally agree that...",
  "consensus_strengths": ["..."],
  "consensus_weaknesses": ["..."],
  "disagreements": ["Reviewer 2 found the contribution significant while Reviewer 4 did not"],
  "resolution": "The contribution is incremental but well-executed",
  "aggregate_scores": {
    "soundness": 3.0,
    "presentation": 2.8,
    "contribution": 2.4,
    "overall": 5.6,
    "confidence": 3.4
  },
  "final_decision": "BORDERLINE",
  "recommendation": "The paper would benefit from stronger baselines and a longer training budget experiment before resubmission."
}
```

### Final Decision Thresholds

| Average Overall | Final Decision |
| --- | --- |
| >= 6.5 | ACCEPT |
| 5.0 - 6.49 | BORDERLINE |
| < 5.0 | REJECT |

## Review Guidelines by Venue

### NeurIPS / ICML / ICLR Main Conference

- Novelty required: significant advance over existing methods
- Reproducibility: full hyperparameters, code availability expected
- Experiments: multiple datasets, strong baselines, statistical significance
- Typical acceptance rate: 25-32%

### Workshop Papers

- Lower novelty bar: interesting findings or negative results acceptable
- Shorter format (4-6 pages)
- Emphasis on insight over comprehensiveness
- Typical acceptance rate: 50-70%

### Format-Specific Prompts

When reviewing for a specific venue, the review command accepts a `--format` flag that adjusts the reviewer prompt:

- `--format neurips` — Full conference rigor
- `--format icml` — Full conference rigor
- `--format workshop` — Workshop-appropriate bar, accepts negative results

## File Output

Reviews are written to `.autoresearch/reviews/`:

```
.autoresearch/reviews/
  individual/
    review-1.json
    review-2.json
    review-3.json
    review-4.json
    review-5.json
  meta-review.json
  review-summary.md     # Human-readable summary
```

## Validation of the Reviewer

The AI Scientist's Automated Reviewer was validated against human reviewers:

- Balanced accuracy comparable to human inter-reviewer agreement (~66-69%)
- F1 score of 0.62 vs human inter-group agreement of 0.49
- Performance held on papers published after the model's training cutoff
- Best results with ensemble of 5 reviews + meta-review (single reviews are noisier)

## Limitations

- The automated reviewer reflects average reviewer quality, not expert review
- Borderline decisions (overall 5-6) have the lowest reliability
- The reviewer cannot verify experimental claims — it assesses presentation and apparent methodology
- Reviews may miss subtle mathematical errors or implementation bugs
- Bias toward well-formatted papers with clear structure
