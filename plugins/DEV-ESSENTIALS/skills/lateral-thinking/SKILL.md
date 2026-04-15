---
name: lateral-thinking
description: Use when stuck, blocked, or spinning on a problem. Diagnoses the stagnation pattern (spinning, oscillation, diminishing returns, assumption lock-in, complexity trap), selects the right thinking persona (Contrarian, Hacker, Simplifier, Researcher, Architect), and reframes the problem from a fresh angle. Triggers on keywords like "stuck", "blocked", "can't figure out", "lateral thinking", "different perspective", "unstuck", "going in circles", "not making progress".
---

## Lateral Thinking — Break Through Development Blocks

When you're stuck, more effort in the same direction rarely helps. This skill diagnoses *why* you're stuck and applies a targeted thinking persona to reframe the problem.

### Step 1: Understand the Issue

Before selecting a persona, gather context from the user. Ask:

1. **What are you stuck on?** Get a concrete description of the problem.
2. **What have you tried?** List the approaches attempted so far.
3. **What happens when you try?** Understand the failure mode — errors, wrong results, or just no progress.
4. **How long have you been on this?** Gauge whether this is a fresh obstacle or a chronic block.

Do NOT skip this step. The diagnosis depends on understanding the shape of the stagnation.

### Step 2: Classify the Stagnation Pattern

Based on the user's answers, identify which pattern best describes their situation:

| Pattern | Signals | Example |
|---------|---------|---------|
| **Spinning** | Same approach repeated, same result each time, "I keep trying X but..." | Rewriting the same function hoping it works differently |
| **Oscillation** | Bouncing between two approaches, each fixing what the other breaks | Toggling between sync/async, each causing different failures |
| **Diminishing returns** | Making progress but gains are shrinking toward zero | Optimization work yielding 0.1% improvements |
| **Assumption lock-in** | Haven't questioned whether the constraints are real | "We have to use this library" / "It must be a microservice" |
| **Complexity trap** | Solution has grown too complex to reason about | Can't hold the full system in your head anymore |

If the pattern is ambiguous, state your assessment and ask the user to confirm before proceeding.

### Step 3: Select and Load the Thinking Persona

Each persona is a different mode of thinking. Load **only one** based on the diagnosed pattern:

| Stagnation Pattern | Primary Persona | Resource File |
|--------------------|----------------|---------------|
| Spinning + repeating same approach | **Contrarian** | `resources/contrarian.md` |
| Spinning + lack of information | **Researcher** | `resources/researcher.md` |
| Oscillation + structural issue | **Architect** | `resources/architect.md` |
| Diminishing returns + over-engineering | **Simplifier** | `resources/simplifier.md` |
| Assumption lock-in | **Contrarian** | `resources/contrarian.md` |
| Complexity trap | **Simplifier** | `resources/simplifier.md` |
| Need a creative workaround | **Hacker** | `resources/hacker.md` |

**If unclear**, default to **Hacker** — unconventional angles work across all patterns.

Read the selected resource file to load the persona's thinking methodology.

### Step 4: Apply the Persona

Once loaded, adopt the persona fully:

1. **Reframe the problem** using the persona's core question.
2. **Walk through the persona's methodology** step by step, applied to the user's specific situation.
3. **Propose a concrete path forward** — not abstract advice, but a specific next action the user can take.
4. **Check in** — ask the user if the reframing resonates or if a different persona might help.

### Switching Personas

If the first persona doesn't unlock progress, offer to try a different one. The user can also request a specific persona directly:
- "Try the contrarian angle"
- "What would the simplifier say?"
- "Can the researcher investigate this?"

### Available Personas

| Persona | Core Question | Best For |
|---------|--------------|----------|
| **Contrarian** | "What if the opposite were true?" | Challenging assumptions, inverting requirements |
| **Hacker** | "What constraints are actually real?" | Creative workarounds, prototype-first solutions |
| **Simplifier** | "What's the simplest thing that could work?" | Reducing complexity, removing unnecessary layers |
| **Researcher** | "What evidence do we actually have?" | Gathering facts before solutions, investigating root causes |
| **Architect** | "If we started over, would we build it this way?" | Structural problems, wrong decomposition |
