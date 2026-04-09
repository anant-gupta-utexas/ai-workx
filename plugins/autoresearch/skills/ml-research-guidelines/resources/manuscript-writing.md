# Manuscript Writing

Protocol for generating a research manuscript from experiment results, following the AI Scientist's section-by-section approach.

## Overview

Phase 3 of the research pipeline: synthesize experiment findings into a complete scientific paper. The paper-writer agent uses experiment logs, figures, and literature search results to produce a LaTeX manuscript.

## Manuscript Structure

Standard ML conference paper format:

1. **Title** — Concise, descriptive, includes the key contribution
2. **Abstract** (~200 words) — Problem, method, key results, significance
3. **Introduction** — Motivation, problem statement, contributions list
4. **Related Work** — Prior art, how this work differs (built via literature search)
5. **Methods** — Technical approach, model architecture, training details
6. **Experiments** — Setup, results, comparisons, ablations
7. **Discussion** — Interpretation, limitations, broader impact
8. **Conclusion** — Summary of contributions, future work
9. **References** — Generated via literature search protocol

## Writing Protocol

### Phase 1: Gather Materials

Before writing, collect:

- `.autoresearch/experiments/experiment-log.jsonl` — all experiment results
- `.autoresearch/experiments/best-config.json` — final configuration
- `.autoresearch/tree/` — tree search history (if applicable)
- Generated figures and plots
- Literature search results from `./literature-search.md` protocol

### Phase 2: Generate Figures

Create publication-quality figures:

1. **Training curves** — val_bpb over steps for key experiments
2. **Comparison bar charts** — val_bpb across configurations
3. **Ablation tables** — contribution of each component
4. **Architecture diagrams** — if novel architecture is proposed
5. **Scaling plots** — performance vs compute budget

Each figure should have:
- Clear axis labels with units
- Legends for all series
- Caption explaining the key takeaway
- Error bars (mean +/- std) for replicated experiments

### Phase 3: Section-by-Section Writing

Write each section using experiment notes and results. The writing model should:

1. Draft the section
2. Self-review for accuracy against experiment data
3. Revise based on self-review
4. Integrate citations from literature search

### Phase 4: VLM Figure Review (Optional)

If a vision-language model is available:

1. Pass each figure + caption to the VLM
2. VLM critiques: unclear labels, missing legends, misleading scales
3. Regenerate figures based on VLM feedback
4. Verify alignment between figures and text

### Phase 5: LaTeX Compilation

1. Compile the LaTeX source
2. Check for compilation errors
3. Auto-fix common errors (missing references, undefined citations)
4. Repeat up to 5 rounds until clean compilation
5. Generate PDF output

## Writing Guidelines

### Abstract

- First sentence: state the problem and why it matters
- Second sentence: describe the approach at a high level
- Third sentence: summarize the key quantitative result
- Final sentence: state the significance or implication

### Introduction

- Open with the broad challenge (1 paragraph)
- Narrow to the specific problem (1 paragraph)
- State what this paper does (1 paragraph)
- List contributions as bullet points (3-4 items)

### Methods

- Be precise enough for reproduction
- Include all hyperparameters in a table
- Reference the experiment protocol for details
- Distinguish between the method and implementation details

### Experiments

- State the evaluation metric and why it's appropriate
- Present results in tables with bold for best values
- Include ablation studies showing each component's contribution
- Discuss any surprising or negative results honestly

### Limitations

Every paper should explicitly state:
- What the method cannot do
- Under what conditions the results may not hold
- What resources were required (compute, data, time)

## Workshop vs Conference Format

### Workshop Papers (4-6 pages)

- More focused, often a single compelling finding
- Negative results are welcome (especially for venues like ICBINB)
- Shorter related work section
- Emphasis on insight over comprehensiveness

### Conference Papers (8-10 pages)

- Must demonstrate clear novelty over prior work
- Comprehensive experiments with multiple baselines
- Thorough ablation studies
- Detailed reproducibility section

## Output

The manuscript is written to `.autoresearch/manuscripts/`:

```
.autoresearch/manuscripts/
  draft-v1.tex        # LaTeX source
  draft-v1.pdf        # Compiled PDF
  figures/             # All generated figures
    fig1-training.pdf
    fig2-comparison.pdf
    fig3-ablation.pdf
  references.bib       # BibTeX file
```

## Quality Checklist

Before submitting for review:

- [ ] Abstract accurately reflects the paper content
- [ ] All figures have captions that explain the key takeaway
- [ ] All tables have the best values in bold
- [ ] All claims have supporting citations or experimental evidence
- [ ] Limitations section is honest and specific
- [ ] LaTeX compiles without warnings
- [ ] References are complete (no "?" placeholders)
- [ ] Page limit is respected
