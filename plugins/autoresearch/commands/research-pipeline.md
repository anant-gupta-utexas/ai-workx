---
description: Run the full AI Scientist research pipeline across 4 phases (ideation, experimentation, manuscript, review)
argument-hint: <research-topic> | resume | status
---

Run the full AI Scientist research pipeline. This command coordinates the 4-phase lifecycle using the research-orchestrator agent.

## Arguments

- `<research-topic>` — Start a new pipeline on this topic
- `resume` — Resume the pipeline from the last incomplete phase
- `status` — Show current pipeline status without running anything

## Phase 1: Ideation

1. Read `.autoresearch/config.yaml` for research scope. If it doesn't exist, create it:
   ```yaml
   topic: "$ARGUMENTS"
   metric: val_bpb
   time_budget: 300
   parallel: auto
   ```

2. Generate 5-10 research directions based on the topic:
   - Each direction has a title, hypothesis, and experimental plan
   - Self-assess each for interestingness, novelty, and feasibility (1-10)

3. Check novelty for each direction:
   - Query Semantic Scholar MCP (or web search) for similar work
   - Discard directions that closely match existing papers
   - Refine directions with partial overlap

4. Select the top 1-3 directions based on novelty + feasibility scores

5. Write selected ideas to `.autoresearch/ideas/`:
   ```
   .autoresearch/ideas/
     idea-001.md   # Title, hypothesis, experimental plan, novelty assessment
     idea-002.md
   ```

6. Report ideas and ask for user confirmation before proceeding to Phase 2.

## Phase 2: Experimentation

1. Read the selected idea from `.autoresearch/ideas/`

2. Determine the execution strategy based on available infrastructure:
   - **Agent Teams available**: Use `/tree-search` for parallel exploration
   - **SkyPilot available**: Use `/sweep --parallel` with GPU clusters
   - **Single GPU**: Use sequential `/experiment` loop

3. Execute the experimental plan:
   - Start with `/experiment baseline` to establish the baseline
   - Run the experiment sequence from the idea's plan
   - Log all results to `.autoresearch/experiments/`

4. Monitor for diminishing returns. When detected:
   - Report the best configuration found
   - Summarize the search trajectory
   - Recommend transitioning to Phase 3

5. Suggest `/clear` to free context before Phase 3.

## Phase 3: Manuscript

1. Read experiment results from `.autoresearch/experiments/`

2. Dispatch to the paper-writer agent with:
   - The original idea from `.autoresearch/ideas/`
   - The experiment log from `.autoresearch/experiments/experiment-log.jsonl`
   - The best configuration from `.autoresearch/experiments/best-config.json`

3. The paper-writer generates:
   - Figures from experiment data
   - Complete LaTeX manuscript
   - BibTeX references via literature search

4. Output to `.autoresearch/manuscripts/`:
   ```
   draft-v1.tex
   draft-v1.pdf (if compilation succeeds)
   figures/
   references.bib
   ```

5. Suggest `/clear` before Phase 4.

## Phase 4: Review

1. Run `/review-paper .autoresearch/manuscripts/draft-v1.tex`

2. The review command produces:
   - 5 independent reviews
   - 1 meta-review with final decision
   - Written to `.autoresearch/reviews/`

3. Report the final assessment:
   ```
   PIPELINE COMPLETE
   ═════════════════
   Topic:    [research topic]
   Phases:   4/4 complete
   
   Best Result:
     val_bpb: X.XXX (from Y.YYY baseline, Z.Z% improvement)
   
   Manuscript: .autoresearch/manuscripts/draft-v1.tex
   
   Review Decision: ACCEPT / BORDERLINE / REJECT
     Overall Score: X.X / 10
     Key Strengths: [from meta-review]
     Key Weaknesses: [from meta-review]
   
   Recommendation: [submit to workshop / revise and resubmit / new direction]
   ```

## Status Check

When `$ARGUMENTS` is "status", report without running anything:

```
PIPELINE STATUS
═══════════════
Topic:     [from config.yaml]
Phase 1:   [complete / in-progress / not started]
  Ideas:   [N ideas generated, M selected]
Phase 2:   [complete / in-progress / not started]
  Experiments: [N total, M improved, best val_bpb: X.XXX]
Phase 3:   [complete / in-progress / not started]
  Manuscript: [exists / not started]
Phase 4:   [complete / in-progress / not started]
  Review:  [decision / not started]
```
