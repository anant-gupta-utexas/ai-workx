---
description: Update dev documentation before context compaction, with automatic consolidation
argument-hint: Optional - specific context or tasks to focus on (leave empty for comprehensive update)
---

We're approaching context limits. Update the development documentation and consolidate to ensure seamless continuation.

## CONSOLIDATED DOCUMENTATION SYSTEM

This directory uses a consolidated structure with active docs + archive. Follow this process to keep it organized.

---

## Phase 1: Update Active Documentation

### 1. Update Context Files
- **`phase-2-context.md`**
  - Current implementation state
  - Key decisions made this session
  - Files modified and why
  - Blockers/issues discovered
  - Next immediate steps
  - Last Updated timestamp

- **`phase-2-tasks.md`**
  - Mark completed tasks as ✅
  - Update in-progress status
  - Add newly discovered tasks
  - Reorder priorities if needed

### 2. Update Master Files
- **`README.md`** - Update status, timelines, links
- **`PHASE-2-OVERVIEW.md`** - Update progress %, deliverables, success criteria
- **`SESSION-LOG.md`** - Add latest session accomplishments
- **`WEEK-2-IMPLEMENTATION-PLAN.md`** - Update task status if week 2 started

---

## Phase 2: Consolidation Rules (CRITICAL)

### When to Archive
Move files to `archive/` if:
- File is outdated/superseded (e.g., old plan, old session notes)
- Content duplicated in active files
- Historical reference only
- Filename contains date (e.g., `phase-2-session-2025-11-15.md`)

### Files That Never Get Archived
- `README.md` - Master index
- `PHASE-2-OVERVIEW.md` - Current overview
- `SESSION-LOG.md` - Consolidated sessions
- `phase-2-context.md` - Current decisions
- `phase-2-tasks.md` - Current tracking
- `WEEK-2-IMPLEMENTATION-PLAN.md` - Current tasks

### Archive Command Template
```bash
cd dev/active/phase-2-foundation
# Move superseded/dated files to archive/
mv [old-file].md archive/
# Do NOT delete - archive for history
```

---

## Phase 3: Consolidation Actions

### If Adding New Documentation
1. **Check first:** Does this duplicate existing content?
   - Yes? → Merge into appropriate active file, archive original
   - No? → Keep in active if essential, else archive

2. **Name it clearly:** Avoid dates, use purpose
   - ❌ `phase-2-session-2025-11-15.md` - Gets archived
   - ✅ Update `SESSION-LOG.md` instead

### If Session Complete
1. Update `SESSION-LOG.md` with accomplishments
2. Archive session-specific files (dated files)
3. Update `PHASE-2-OVERVIEW.md` with new status
4. Move outdated planning files to `archive/`

### If Week Transitions (Week 1 → 2 → 3)
1. Consolidate previous week's sessions into `SESSION-LOG.md`
2. Archive old implementation plans (e.g., `WEEK-2-IMPLEMENTATION-PLAN.md` if moving to week 3)
3. Create new week plan in active directory
4. Update `README.md` with new week status

---

## Phase 4: Files to Check/Update

| File | Update When | Action |
|------|------------|--------|
| `README.md` | Always | Status, progress %, links |
| `PHASE-2-OVERVIEW.md` | New deliverables | Add to Week section |
| `SESSION-LOG.md` | Session end | Add accomplishments |
| `phase-2-context.md` | New decisions | Add to decisions section |
| `phase-2-tasks.md` | Task changes | Mark ✅, add new |
| `WEEK-*-IMPLEMENTATION-PLAN.md` | Week active | Update task status |
| Dated session files | After use | Move to `archive/` |

---

## Archiving Checklist

Before archiving a file, verify:
- [ ] Content not needed by active developers
- [ ] Information preserved in active file (or doesn't need to be)
- [ ] No breaking links in other files
- [ ] `archive/` folder exists
- [ ] All data preserved (nothing deleted)

Archiving Examples:
```bash
# Dated session files
mv phase-2-session-2025-11-15.md archive/

# Superseded plans
mv phase-2-foundation-plan.md archive/

# Merged updates
mv PHASE-2-PLAN-UPDATES.md archive/

# Old summaries
mv PHASE-2-WEEK1-SUMMARY.md archive/
```

---

## Session Capture Template (for SESSION-LOG.md)

Add to SESSION-LOG.md format:

```markdown
## Session: [Date] ([Week X.Y])

**Duration:** [time]
**Status:** ✅ COMPLETE | 🔄 IN PROGRESS | ⏭️ PENDING

### Accomplished
- [Feature/task completed]
- [Tests passing]

### Problems Solved
- [Problem]: [Solution]

### Decisions
- [Decision]: [Rationale]

### Performance
- [Metric]: [Result]

### Next Steps
- [Action]
```

---

## Final Checklist

- [ ] Context files updated
- [ ] Session added to SESSION-LOG.md
- [ ] Outdated files moved to `archive/`
- [ ] `PHASE-2-OVERVIEW.md` updated with progress
- [ ] `README.md` updated with status
- [ ] No duplicate information in active files
- [ ] All links still valid
- [ ] Archive folder organized

**Result:** Clean active documentation, preserved history, clear continuation path.