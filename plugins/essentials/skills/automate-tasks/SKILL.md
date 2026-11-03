---
name: automate-tasks
description: Capture a user's working style into a personal <handle>-mode skill that agents follow, by mining recent agent transcripts and asking a few structured questions. Use on "automate me", "automate my tasks", "turn/capture my preferences or working style into a skill", "create/update my -mode skill", or when the user wants agents to work the way they do.
---

# Automate Tasks

Turn a user's working conventions into one `<handle>-mode` skill that agents follow (e.g. `jay-mode`, `priya-mode`).

This is a guided flow: mine the user's recent history, ask them directly, cluster the findings, then author the skill. Authoring itself uses the `skill-developer` skill (essentials), or the harness's own skill-creation skill if that's what is installed. This skill supplies the inputs and the writing discipline, not a second authoring engine.

## Flow

### 0. Check for an existing skill

Look recursively for `.claude/skills/**/*-mode/SKILL.md` and `~/.claude/skills/**/*-mode/SKILL.md` matching the user's handle. Mode skills can live in a personal category directory (`.claude/skills/<handle>/`), not only at the top level. If one exists, confirm intent (unless they already said "update my skill" or similar):

- Update the existing skill (default for repeat runs)
- Start fresh (rare, ask why before doing it)

Update mode changes the rest of the flow:
- Step 1 mines only history since the skill was last edited: `git log -1 --format=%cI <path>` for a skill tracked in git, otherwise the file's modification time (personal skills under `~/.claude/skills/` usually aren't in a repo).
- Step 2 asks what's changed or missing, not what to capture from zero.
- Step 4 edits the existing file in place. Preserve sections the user hasn't contradicted. Revise ones with new evidence. Add new sections only for genuinely new rules.

### 1. Mine their history

Locate the active workspace's transcripts before fanning out. In Claude Code they live in `~/.claude/projects/<encoded-workspace-path>/*.jsonl`; other harnesses name their transcript directory in the system prompt. Use only the current workspace's path. Don't glob across unrelated projects — that crosses workspace boundaries and reads private chats from projects the user didn't ask about. If no transcripts are reachable, skip to step 2 and rely on the direct questions.

Survey recent agent conversations within that scope for recurring patterns. Run multiple parallel subagents across slices of history (e.g. the last 2-4 weeks, split into 3 slices so each has enough material). Pick each subagent's reasoning level and speed for the job. Each slice-mining subagent reads transcripts from the workspace-scoped path the parent provides, looks for the signals below, and returns a short structured list of patterns with evidence pointers. Default signals worth hunting:

- Response preferences (length, tone, format, "dumb it down" corrections)
- Delegation habits (subagents, models, specialized workflows, parallelism)
- Verification posture (what "done" means, unit tests vs live repro, reviewers)
- Code and prose discipline (style, principles cited, lint/format tools)
- Process conventions (worktrees, commits, PRs, review/merge tooling)
- Meta preferences (fixing skills mid-task, proposing new ones)

Cross-check across slices before elevating a signal. Patterns seen in 2+ slices are high-confidence. Lone signals are weak and usually get dropped.

### 2. Ask the user directly

Mining misses intent that hasn't come up yet. Ask the user directly with a short structured multiple-choice prompt rather than making them type from scratch.

Shape: one or two questions with 4-6 options each, allowing multiple selections for category questions. Start broad ("Which areas matter most?"), then follow up on the selected areas with specific options. After the structured rounds, one free-form question catches anything the options missed.

Don't dump 20 questions.

### 3. Cluster findings

Group the combined signals into sections. Common ones (use only what applies):

- **Response style**: length, tone, format.
- **Autonomy**: how much to do without asking, tool use.
- **Understand first**: which skills to reach for when scoping or investigating a change.
- **Subagents**: default, parallelism, model-to-task, specialized workflows.
- **Prose / code discipline**: principles, lint tools, style guides.
- **Review and verify**: repro posture, verification skills, live-testing tools.
- **Process**: git worktrees, commits, PRs, review/merge tooling.
- **Skills**: skill-authoring habits, fix-the-skill-first, proposing new skills.

If you have an existing `-mode` skill to use as a shape reference, read it for granularity — don't copy its content. The user's rules are their own.

### 4. Draft the skill

Author the file with `skill-developer` (or the harness's own skill-creation skill). Placement:

- Path: preserve an existing mode skill's category. For a new mode, use `.claude/skills/<handle>/<handle>-mode/SKILL.md` when the repo has an established personal category for that handle. Otherwise default to `.claude/skills/<handle>-mode/SKILL.md` in the project (or `~/.claude/skills/<handle>-mode/` for a personal skill).
- Handle: the user's first name or chosen identifier.
- Frontmatter `description`: trigger on their name + `/<handle>-mode` + "work in their style", not on generic keywords like "write code" or "review PR". Keep it as one YAML scalar — quote it, or use `description: >-` with indented continuation lines when punctuation or wrapping requires it.
- Set the mode skill to explicit-invocation-only by default — in Claude Code, `disable-model-invocation: true` in the frontmatter, so it runs only via `/<handle>-mode`. The description still matters: it's what the user sees in the slash-command menu. Opt out only if the user explicitly wants their mode to apply automatically.

### 5. Iterate on prose

Show the draft to the user and take feedback. Expect multiple iterations. Cut ruthlessly — a mode skill is not a manual. Apply this discipline to every line:

- **Explain the why.** Models respond better to intent than to rigid rules. Instead of ALL-CAPS ALWAYS/NEVER, say why something matters.
- **Keep it lean.** Drop any line that isn't pulling its weight. If an instruction would send the agent down an unproductive path, cut it.
- **Generalize, don't overfit.** A `-mode` skill applies across many future tasks. Prefer a rule that captures the pattern over one that patches a single remembered incident.

### 6. Land it

- **Personal skill** (`~/.claude/skills/`): save the file. Nothing to commit.
- **Project skill** (in a repo): follow the repo's own git conventions — the ones just captured in the mode skill, or the repo's `CLAUDE.md` / `AGENTS.md`. If none exist, ask before committing; never push without the user's go-ahead.

## Guardrails

- **Don't overfit to one conversation.** A preference stated once and contradicted another time is noise. Require multiple instances before codifying it.
- **Don't be clever.** Restating other skills' contents, inventing metaphors, or writing "poetic" prose for an agent reader is cost without benefit. Keep it operational.
- **Reference, don't inline.** Other skills the user relies on should appear as path references, not pasted excerpts. Same for any principle docs they maintain elsewhere.
- **Keep sections minimal.** Only add a section if the user has a specific, non-default rule there. "Communicate clearly" is not a section. "Short paragraphs. Tables when comparing options. Bullets only when items are genuinely parallel." is.
- **Name conventions generic.** Use "the user" or "the human" in imperatives, not the author's first name. The handle belongs in the skill's name and description only.
- **Nothing sensitive leaves the transcripts.** Never copy secrets, tokens, credentials, internal URLs, customer data, or other people's names into the skill. Capture the rule ("load API keys from the env file"), not the value.
- **Don't force symmetry.** If a user has no process rules worth writing down, skip the Process section entirely.

## Evaluation

A `-mode` skill is subjective output. A test/iterate benchmark loop isn't useful here. Vibe-check with the user: does it read like them? Did it miss anything? Then ship. Revisit the description (see `skill-developer`'s guidance on writing descriptions) only if the skill's trigger accuracy turns out to be a problem in practice.

## When not to use

- User wants a task-specific skill (not working conventions): use `skill-developer` directly, no mining required.
- User wants to capture one narrow workflow (e.g. "how I write commit messages"). That's a regular skill, not a mode skill.
