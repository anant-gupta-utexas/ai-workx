---
name: dev-docs
description: Detail ONE TRD phase into a per-phase Task Specification (TRS) with a flat, executable task list under `dev/active/[task-name]/`, then keep those task docs current while the work is implemented. Use when the user asks to "create a TRS", "break down Phase N", "plan the tasks for this phase", or runs `/dev-docs <feature>`. Also use while implementing work tracked in `dev/active/[task-name]/` — after completing a task, or before context compaction or handoff ("update dev docs", "save progress", "write handoff notes"). Does not re-plan releases (PRD-owned) or phases (TRD-owned).
argument-hint: Feature name, and optionally a phase id (e.g., "search-feature", "search-feature Phase 1")
---

# Dev docs (per-phase TRS)

Two operations:

- **Create** — take **one** phase from the TRD and detail it into a flat, executable task list plus the files that track it.
- **Update** — keep those files current as tasks are completed, and write a full handoff before context compaction or the end of a session.

The update protocol is also written into the header of every generated tasks file. That is what makes updates automatic: any agent that later works from the task list reads the protocol there, even in a session where this skill isn't loaded.

Arguments: $ARGUMENTS

## Nomenclature

These definitions match the Shared Nomenclature in `consult-experts`. Do not redefine them.

- **Release** — *PRD-owned.* A user-facing increment named with semver. `v0.1.0` is the MVP; later releases layer on value. Features not scheduled into any release live in the PRD's **Deferred Features** section.
- **Phase** — *TRD-owned.* An engineering tranche that delivers one or more PRD releases. Each phase states which release(s) it delivers (e.g., "Phase 1 → delivers `v0.1.0`").
- **Task** — *owned by this skill.* A discrete unit of work inside **one** TRD phase. Tasks are a flat list — never nested sub-phases.

Never use "phase" to mean SDLC ceremonies (Discovery / Design / Development / QA / Launch).

## File layout

```
dev/
├── README.md                        # Shared handoff notes across active tasks
├── session-log.md                   # Running log of sessions
└── active/
    └── [task-name]/                 # [feature-name]-phase-N, e.g. search-feature-phase-1
        ├── [task-name]-plan.md      # The TRS
        ├── [task-name]-plan-<section>.md  # Optional companion, only when the plan would exceed 800 lines
        ├── [task-name]-tasks.md     # Checklist + update protocol header
        └── [task-name]-context.md   # Current state, decisions, blockers, next step
```

Review documents written into the same folder by other tools (`[task-name]-code-review.md` from the `consult-experts` Code Reviewer, `[task-name]-plan-review.md` from the `plan-reviewer` agent) are part of the record. Never consolidate or delete them.

## File size limit

Keep every markdown file this skill creates or updates at **800 lines or fewer**. Long files are hard for agents and people to navigate and get partially read.

- **Plan too long:** move the heaviest sections (usually API Specifications, Database Design, or Algorithm & Logic Design) into companion files named `[task-name]-plan-<section>.md` (e.g., `search-feature-phase-1-plan-api.md`). Leave a one-line summary and a link in the main plan.
- **Task list too long:** tighten task descriptions first. If the phase genuinely holds more tasks than fit, tell the user the TRD phase may be too large to execute as one tranche — but don't re-split the phase yourself; the TRD owns phases.
- **Context file growing:** it records the *current* state. Replace outdated entries instead of appending history; history belongs in the session log.
- **Session log growing:** when `dev/session-log.md` nears the limit, condense the oldest entries into a short "Earlier sessions" summary at the top.

---

## Operation: Create

### Inputs — read first

- PRD at `/docs/01_product/PRD.md` (release context)
- TRD at `/docs/02_architecture/TRD.md` (the phase you'll detail)

### Steps

1. **Analyze the request** and determine the scope of planning needed.
2. **Read the PRD and TRD.** Locate the TRD's **Development Phases** section. If it has none, **stop** and tell the user the TRD needs regenerating (e.g., via the `consult-experts` Tech Lead) before a useful TRS can be produced.
3. **Pick exactly one phase.** If the arguments name a phase (e.g., `Phase 1`), use it. Otherwise list the TRD's phases with their release tags ("Phase 1 → delivers `v0.1.0`; Phase 2 → delivers `v0.2.0`") and ask which one to detail.
4. **Ask before assuming.** If required information is missing, ask. Offer options with a short comparison of the approaches.
5. **Write the TRS** for the chosen phase with these sections:
   - **Phase Summary** — the TRD phase, the PRD release(s) it delivers, and its one-line goal (copied from the TRD, not re-derived)
   - **Overview & Scope**
   - **Requirements Summary**
   - **Detailed Component Design** — classes/modules, method signatures, data structures
   - **API Specifications** — endpoints, request/response schemas, error handling, authentication, rate limiting
   - **Database Design** — tables, relationships, indexes, constraints; data access patterns; migration strategy
   - **Algorithm & Logic Design** — pseudocode for complex operations
   - **Error Handling & Edge Cases** — failures, invalid input, timeouts; retry and fallback strategies
   - **Dependencies & Interfaces**
   - **Security Considerations** — input validation, authorization, sanitization
   - **Testing Strategy** — unit approach, test data, mocking, coverage expectations
   - **Performance Considerations** — load patterns, optimization, caching, monitoring
   - **Tasks** — a **flat** list for this phase only, in execution order, with cross-task ordering expressed through `Dependencies`. For each task:

     ```markdown
     * **[Task Name]** [Effort: S/M/L/XL]
       - **Description**: What needs to be done
       - **Acceptance Criteria**:
           - [ ] Specific, testable criterion 1
           - [ ] Specific, testable criterion 2
       - **Files to Create/Modify**:
           - `path/to/file.py` - Purpose
       - **Dependencies**: Task #X, Task #Y
       - **Testing Requirements**: Unit/Integration/E2E
     ```

   - **Phase Deliverables** — working feature(s) delivering the tagged release(s), tests passing, documentation updated
   - **Pending Decisions & Clarifications** — open items needing user input, with options
6. **Create the task files** in `dev/active/[task-name]/` using `[task-name]` = `[feature-name]-phase-N`:
   - `[task-name]-plan.md` — the TRS above. Add this line directly under the title: `> Progress is tracked in [task-name]-tasks.md — follow the update protocol at the top of that file.`
   - `[task-name]-tasks.md` — use the template below, including the update protocol header verbatim.
   - `[task-name]-context.md` — use the template below.
7. **Initialize shared files** if missing: create `dev/README.md` with a one-line entry for this task, and an empty `dev/session-log.md`.

### `[task-name]-tasks.md` template

```markdown
# [task-name] — tasks

> **Update protocol — applies to any agent working on these tasks.**
> After finishing each task, before starting the next:
> 1. Tick it below (`- [x]`) and add any newly discovered tasks in execution order.
> 2. Update `[task-name]-context.md`: current state, decisions made, files changed and why, blockers, next step, last-updated date.
> 3. If the implementation deviated from `[task-name]-plan.md`, record the deviation in the context file. Don't silently rewrite the plan.
> 4. Keep every markdown file in this folder at 800 lines or fewer.
>
> Before context compaction, handoff, or ending the session, run the full update (the `dev-docs` skill's Update operation; it also writes `dev/README.md` and `dev/session-log.md`).

**Phase:** [TRD phase] → delivers [release]
**Progress:** 0/[N] tasks · last updated [YYYY-MM-DD]

## Tasks

- [ ] 1. [Task name] [Effort: M] — depends on: none
- [ ] 2. [Task name] [Effort: S] — depends on: 1
```

### `[task-name]-context.md` template

```markdown
# [task-name] — context

**Last updated:** [YYYY-MM-DD]

## Current state
[What works, what's in progress, exact file/function being edited.]

## Decisions
- [Decision] — [why]. Pending decisions: see the plan's Pending Decisions section.

## Files changed
- `path/to/file` — [why]

## Deviations from the plan
- [None yet]

## Blockers
- [None]

## Next step
[The single next action.]
```

---

## Operation: Update

Two levels. Pick the one that matches the moment.

### After each completed task (lightweight)

Follow the update protocol in the tasks file header: tick the task and update the progress line, update the context file, record deviations. This takes a minute and should happen before starting the next task, not in a batch at the end.

### Before compaction, handoff, or end of session (full)

For each task folder in `dev/active/` that was worked on in this session:

1. **`[task-name]-tasks.md`** — every finished task ticked, in-progress tasks marked, newly discovered tasks added, progress line and date updated.
2. **`[task-name]-context.md`** — current implementation state, key decisions and technical choices, files modified and why, blockers, next immediate step, last-updated date.

Then the shared files:

3. **`dev/README.md`** — handoff notes for the next session: the exact file and line being edited, the immediate goal, uncommitted changes, and the commands to run tests.
4. **`dev/session-log.md`** — append a dated entry: problems solved, architectural decisions, bugs fixed, testing approach, performance work.

Finally, consolidate:

5. If a task folder has picked up extra ad-hoc notes, fold their content into the core files above. Propose deleting the extras and wait for the user to confirm. Never touch the review documents, and don't create archive folders.

**Checklist:**

- [ ] Tasks file reflects reality (✅ or pending for every task)
- [ ] Context file has current state and next step
- [ ] `dev/README.md` has handoff notes
- [ ] `dev/session-log.md` has this session's entry
- [ ] No duplicate information across the files
- [ ] No markdown file over 800 lines

If the user passed arguments when asking for an update, focus the update on that area.

---

## Quality standards

- Plans are self-contained, with all the context an implementer needs.
- Language is clear and actionable, with specific technical detail.
- Consider both technical and business perspectives.

## Pitfalls

- **Don't skip clarifying questions.** Assumptions cause rework.
- **Don't re-plan releases or phases.** The PRD owns releases and the TRD owns phases. If you want to change either, stop and route the user back to the PRD/TRD workflow (`consult-experts`).
- **Don't nest phases inside the chosen phase.** Tasks are flat; sequence them with `Dependencies`.
- **Don't batch updates to the end.** A task list that's only updated at session end is wrong whenever the session ends unexpectedly.
