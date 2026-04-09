# Hyperparameter Tuning

Strategies for searching the hyperparameter space efficiently, from sequential hill-climbing to parallel factorial grids.

## Search Strategies

### Sequential Hill-Climbing (Single GPU)

Test one change at a time, keep if it improves, discard if not. Simple but slow — one hypothesis per 5-minute window.

**Best for:** Initial exploration when you don't know which knobs matter.

### Factorial Grid Search (Parallel)

Test all combinations of N values across M parameters in a single wave. With 16 GPUs, you can test a 4x4 grid (16 combinations) in one 5-minute window.

**Best for:** Once you've identified 2-3 important parameters, find their optimal combination and interaction effects.

Example: Test `weight_decay` in {0.04, 0.08, 0.12, 0.2} x `adam_beta2` in {0.90, 0.93, 0.95, 0.99} = 16 experiments in one wave.

### One-Factor-at-a-Time (OFAT)

Hold everything constant, vary one parameter across its range. Fast with parallel execution but misses interaction effects.

**Best for:** Understanding the sensitivity of a single parameter.

### Bayesian-Informed Search

Use results from previous experiments to inform the next batch. Not formally Bayesian optimization, but the agent should reason about gradients in the result landscape.

**Best for:** Late-stage optimization when the landscape is partially mapped.

## Key Hyperparameters

### Training

| Parameter | Default | Range to Explore | Notes |
| --- | --- | --- | --- |
| `TOTAL_BATCH_SIZE` | 2^19 | 2^16 - 2^20 | Smaller = more steps in time budget |
| `WARMDOWN_RATIO` | 0.6 | 0.3 - 0.8 | Fraction of training in warmdown phase |
| `FINAL_LR_FRAC` | 0.05 | 0.01 - 0.1 | LR at end of training as fraction of peak |

### Optimizer

| Parameter | Default | Range to Explore | Notes |
| --- | --- | --- | --- |
| `MATRIX_LR` | 0.05 | 0.01 - 0.1 | Muon LR for weight matrices |
| `EMBEDDING_LR` | 0.6 | 0.1 - 1.0 | AdamW LR for token embeddings |
| `SCALAR_LR` | 0.5 | 0.1 - 1.0 | AdamW LR for residual mixing scalars |
| `ADAM_BETAS` | (0.9, 0.95) | beta1: 0.7-0.9, beta2: 0.90-0.99 | Lower beta1 can help with Muon |
| `WEIGHT_DECAY` | 0.2 | 0.04 - 0.2 | Lower values often help |
| `muon_beta2` | 0.95 | 0.95 - 0.99 | Muon second-momentum; 0.98 often wins |
| `ns_steps` | 5 | 3 - 7 | Newton-Schulz iteration steps for Muon |

### Architecture

See `./architecture-search.md` for architecture-specific parameters.

## Sweep Protocol

### Wave-Based Sweeping (Parallel)

1. **Define the grid**: Choose 2-3 parameters, 3-5 values each
2. **Launch wave**: Submit all combinations simultaneously (via Agent Teams or SkyPilot)
3. **Collect results**: Wait for all experiments to complete
4. **Analyze**: Rank by val_bpb, look for interaction effects
5. **Narrow**: Take the top-performing region, define a finer grid
6. **Repeat**: Until improvement per wave drops below threshold

### Interaction Detection

When running factorial grids, check if parameters interact:

- If the best `weight_decay` is the same regardless of `adam_beta2`, they don't interact
- If the best `weight_decay` changes depending on `adam_beta2`, they interact — always test them together

### Early Stopping Heuristic

Stop tuning a parameter when:

- The best 3 values differ by < 0.001 val_bpb
- You've tested the full reasonable range
- Results are inconsistent across hardware types (noise > signal)

## Common Findings from Autoresearch

These patterns emerged from SkyPilot-scaled autoresearch on H100/H200:

- Halving batch size (2^19 -> 2^18) often helps — more optimizer steps in the time budget
- `WEIGHT_DECAY = 0.08` frequently beats the default 0.2
- `ADAM_BETAS = (0.70, 0.95)` can outperform (0.9, 0.95) with Muon
- `muon_beta2 = 0.98` was the single most valuable late-stage discovery
- Softcap 10 (logit soft-capping) gives a small but consistent improvement
- Deeper models (DEPTH 10+) often crash or underperform — not enough steps in 5 min
