# review — 45-minute monthly / quarterly reflection

Called via `cos review`. Use at end of month, end of quarter, or when the user
explicitly asks for "monthly review" / "quarterly review" / "goals review".

## Mode selection

Ask the user once, if not obvious from context:

> "Monthly, quarterly, or annual review?"

The steps are the same; the goals-check depth differs.

## Steps

1. **Preconditions.**
   - Everything in SKILL.md preconditions + weekly.md step 1.
   - Also read:
     - `docs/05_personal/core_docs/goals/<year>_goals.md`
     - `docs/05_personal/core_docs/principles.md`
     - `docs/03_projects/_meta/personal-os-plan.md` (or the repo's current
       multi-project plan — look at `_meta/` for the canonical driver).
     - `docs/03_projects/ideas.md`
     - `docs/03_projects/README.md` (for the project status table).

2. **Run the weekly operation first (steps 2–8 of weekly.md).**
   - You need the dashboard refresh and state updates the weekly gives you.
   - Skip step 10 (weekly output) — roll that into the review output.

3. **Goals vs. actuals.**
   - For each goal in the annual goals file, count completed tasks in
     `docs/00_ops/tasks/done.md` (or scan git history) that plausibly
     contributed to it.
   - Do not score numerically. Give a one-line qualitative read per goal:
     `on track` / `stalling` / `abandoned` / `ahead`.
   - For quarterly runs, propose a quarterly review entry in the goals file
     under `### Q{N} <year> review`.

4. **Project phase check.**
   - For each project, compare current `phase` to the timeline in
     `_meta/personal-os-plan.md` (if present). Flag projects behind or ahead
     of plan.
   - For `design`/`scaffold` projects > 60 days old, propose either
     promotion to `build` or demotion to `someday.md` (project-level).

5. **Wiki status.**
   - Delegate to `maintaining-wiki status`. Do not inline.
   - Surface the result: page count, ingest velocity, stale pages, pending
     reductions.

6. **Ideas prune.**
   - Read `docs/03_projects/ideas.md`.
   - For each idea older than 90 days with no activity, propose either
     promotion (a folder under `docs/03_projects/<name>/`) or deletion.
   - Do not delete yourself — propose and wait.

7. **Principles revisit.**
   - Read `docs/05_personal/core_docs/principles.md`.
   - Do not propose edits. Ask the user a single question:
     > "Anything in your principles you've drifted from this month?"
   - Write their answer (if given) to
     `docs/05_personal/journal/YYYY/MM-month/monthly.md` in a `## Principles
     check` section (or the quarterly/annual equivalent).

8. **Inbox + suggestions retrospective.**
   - Count items the user accepted vs. rejected vs. deferred in
     `cos-suggestions.md` since the last review.
   - If the accept-rate is very low (< 20% over 6+ suggestions), flag it and
     propose tightening the self-advocacy bar for the next cycle.

9. **State.md update.**
   - Bump `last_cos_weekly`, `last_cos_daily`.
   - If monthly mode: bump `last_monthly_reflection`.
   - If quarterly mode: bump `last_quarterly_review`.
   - If annual mode: bump both and flag the user to also run the annual
     archive manually (journal rollover, `<year>_goals.md` → next year).

10. **Regenerate `dashboard.md`.**
    - Same shape as weekly.
    - Prepend a `## Review summary` block above the normal dashboard body:
      ```markdown
      ## Review summary (monthly | quarterly | annual, YYYY-MM-DD)

      Goals on track: N / M. Stalling: N. Abandoned: N.

      Projects on timeline: N / M. Behind: N. Ahead: N.

      Wiki: <one line from status>.

      Inbox churn: <captures> / <processed> since last review.

      Suggestion accept-rate: N / M.
      ```

11. **Write a review entry to the journal.**
    - Path: `docs/05_personal/journal/YYYY/MM-month/monthly.md`
      (or `week-NN.md` for quarterly/annual, as the repo's convention dictates).
    - Do not overwrite. If the file exists, propose the addition.

12. **Compose the review output.**
    - Lead with the review summary.
    - Follow with weekly's flags (inbox, tasks, projects, wiki).
    - End with the proposed journal entry + dashboard + state writes +
      suggestions appended.
    - Proposed commit:
      ```
      cos(review): {monthly|quarterly|annual} YYYY-MM-DD
      ```

13. **Stop.** Offer one specific next action (e.g. "Want to execute the
    promotion of `<idea>` into a project folder now?"). Do not chain.

## Anti-patterns

- Do not score goals numerically (% completion) unless the user asks — it
  encourages gaming.
- Do not delete items on the user's behalf. Ideas pruning is proposal-only.
- Do not rewrite principles, goals, or plan docs. Annual goals rename is a
  manual, once-a-year operation.
- Do not regenerate the dashboard twice (weekly already does; review just
  prepends the review summary — rewrite the file once at step 10).

## Time budget

~45 minutes of agent time. Quarterly and annual can take 60–90 minutes; that's
acceptable as long as the user asked for it. If monthly is trending past 60
minutes, something in the vault is out of shape — surface that rather than
quietly burning time.
