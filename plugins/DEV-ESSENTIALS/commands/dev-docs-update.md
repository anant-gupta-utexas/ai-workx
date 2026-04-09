---
description: Update dev documentation before context compaction, with automatic consolidation
argument-hint: Optional - specific context or tasks to focus on (leave empty for comprehensive update)
---

We're approaching context limits. Update the development documentation to ensure seamless continuation after context reset.

## Core Documentation Files

Maintain only these files in `/dev/`:
- **README.md** - Project overview, setup, handoff notes
- **[feature-name]-plan.md** - Implementation strategy
- **[feature-name]-task.md** - Task checklist (completed/pending items)
- **[feature-name]-context.md** - Current state, decisions, blockers, next steps
- **session-log.md** - Session progress notes

---

## Required Updates

### 1. Update Task Documentation
For each active task in `/dev/`:
- **[task-name]-context.md**:
  - Current implementation state
  - Key decisions and technical choices
  - Files modified and why
  - Blockers or issues discovered
  - Next immediate steps
  - Last updated timestamp

- **[task-name]-tasks.md**:
  - Mark completed tasks as ✅
  - Update in-progress task status
  - Add any newly discovered tasks
  - Reorder by priority if needed

### 2. Update Core Files
- **README.md**: Add handoff notes for next developer (exact file/line being edited, goals, uncommitted changes, test commands)
- **session-log.md**: Record complex problems solved, architectural decisions, bugs fixed, testing approaches, performance optimizations

### 3. Clean Up Extra Files
If any extra documentation files exist:
- Consolidate their content into the core files above
- Delete the extra files
- Always keep core files up to date instead of creating new ones
- Never use archive folders—consolidate and delete instead

---

## Final Checklist

- [ ] [task-name]-context.md updated with current state
- [ ] [task-name]-tasks.md has all tasks marked (✅ or pending)
- [ ] README.md has handoff notes
- [ ] session-log.md has session accomplishments added
- [ ] Extra documentation files deleted (consolidated into core files)
- [ ] No duplicate information in active files

**Result:** Clean, focused documentation with 5 core files. Clear continuation path for next session.

## Additional Context: $ARGUMENTS