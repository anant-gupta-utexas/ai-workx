# daily — 2-minute snapshot

Called via `cos daily`. Fast. Read-only except for `state.md` bump and (with
user approval) creating today's ops note.

## Steps

1. **Read state.md.**
   - Note `current_focus` (anchor for "what should I work on").
   - Compute overdue cadences: for each `last_*` field, compare to the threshold
     defined in the "Cadence targets" section of the same file. If no target,
     skip.
   - Compute `days_since_last_cos_daily`.

2. **Scan tasks.**
   - Open `docs/00_ops/tasks/active.md`.
   - Pull items due today or tomorrow (or overdue). Parse the `— due YYYY-MM-DD`
     suffix (or any ISO date in the line).
   - Group by `[area:*]` tag. Count per area.
   - Identify the single next action tied to `current_focus`.
   - **Identify stuck items** for step 6: an item is "stuck" if it is overdue OR
     if its `— due YYYY-MM-DD` date is more than 7 days in the past relative to
     today (i.e., the task was already past-due more than a week ago). No git
     archaeology needed — use the due-date as the age proxy.

3. **Check journal.**
   - Look for today's journal file at `docs/05_personal/journal/YYYY/MM-month/DD.md`
     (use the target repo's month-name format — look at sibling files in the
     current month to confirm).
   - If absent, flag "journal missing today" (do not create — that's a human
     action).

4. **Check git cleanliness.**
   - Run `git status --short`. Count tracked dirty files.
   - If dirty for > 1 day and related to ops files, flag.

5. **Check inbox pressure.**
   - Count items in `docs/00_ops/inbox/inbox.md` (one H2 per item).
   - If > 10 or last_inbox_triage older than 10 days, flag.

6. **Ensure today's ops note exists.**
   - Check `docs/00_ops/daily/YYYY-MM-DD.md` (using today's date).
   - If the file **exists**: read `## Wins` and `## Log` from yesterday's ops
     note (`docs/00_ops/daily/YYYY-MM-[DD-1].md`) if it is present. Surface any
     wins from yesterday and any `## Log` items that were not resolved (no
     checkbox checked, no "done" marker). Include these in the headlines below.
   - If the file **does not exist**: add it to the proposal table (step 8b) with
     the canonical schema below. Do **not** create it silently — it requires user
     approval like any non-meta write.

   Canonical ops note schema:

   ```markdown
   ---
   date: YYYY-MM-DD
   type: daily-ops
   ---

   ## Tasks

   <!-- Today's open items, mirrored from active.md filtered to today/overdue. -->

   ## Schedule

   <!-- Time-blocked events. Format: - HH:MM — event -->

   ## Log

   <!-- Append-only. Format: - HH:MM — what happened -->

   ## Wins

   <!-- End-of-day completions. Format: - completed task or milestone -->

   ## Context

   <!-- Backlinks to people, decisions, files touched today. -->
   ```

7. **Smallest first step for stuck items.**
   - From the stuck items identified in step 2, select up to 3 (pick the most
     overdue first, then longest-stuck).
   - For each, propose a single concrete 10-minute wedge: a specific, atomic
     action the user can do right now that makes progress without requiring the
     whole task to complete. Examples:
     - "today: just open the passport application and read section 1"
     - "today: run one LeetCode problem from the BST set, any problem"
     - "today: write the first bullet of the interview prep topic outline"
   - Keep each wedge one sentence. Surface in the daily output below the focus
     statement.
   - The wedge is surface-only. Do **not** update `active.md`. If the user wants
     the wedge to become a subtask, they run `cos update`.

   <!-- Source: morning-briefing-pipeline (Hilary Gridley pattern — break the
        procrastination loop by naming the 10-minute wedge, not the whole task).
        Threshold signal: ten-x-impact-rule (smallest-first-step is the
        operational form of the 10× decomposition). -->

8. **Compose headlines (3–7 bullets max).**
   - Obey notification policy in `operating-contract.md`. Only surface:
     - Items due today/tomorrow (max 3).
     - One "next action" tied to `current_focus`.
     - At most one overdue-cadence flag (the most severe).
     - Journal-missing flag, iff today's past 9pm local.
     - Git dirty flag, iff non-obvious (e.g. half-staged changes).
     - Yesterday's unresolved ops-note log items (if present; max 2).
   - Do not list every task. Do not recount the inbox if it was triaged today.

   **8b. Proposal table** (for any non-meta writes this run):
   - If today's ops note is missing, add one row: create
     `docs/00_ops/daily/YYYY-MM-DD.md` with the canonical schema above.
   - If no non-meta writes needed, write "no user-approvable changes".
   - Show the table and wait for user confirmation before creating the file.

9. **Output the snapshot** using the "Output shape" from SKILL.md, including
   the smallest-first-step wedges under a `## Smallest first step` section
   (only if stuck items exist; omit the section if nothing is stuck).

10. **Write state.md.**
    - Bump `last_cos_daily` to today's date.
    - No other writes.

11. **Propose commit.**
    - If only state.md changed (and no ops note was created), propose:
      ```
      cos(daily): snapshot YYYY-MM-DD
      ```
    - If the user approved creating today's ops note, propose:
      ```
      cos(daily): snapshot YYYY-MM-DD + create daily ops note
      ```
    - If the user accepted other edits during the run, update the message
      to reflect them.

12. **Stop.** Do not run weekly work.

## Anti-patterns

- Do not read the full wiki or project READMEs during a daily. That's weekly/review work.
- Do not regenerate the dashboard on a daily. It stays whatever `cos weekly` produced.
- Do not triage the inbox on a daily. Flag it and stop.
- Do not nag. If the user ran `cos daily` twice in one day, just return a short "nothing new since <HH:MM>".
- Do not create `docs/00_ops/daily/YYYY-MM-DD.md` silently. It goes on the proposal table and requires user approval.
- Do not propose more than 3 wedges in one daily — pick the most stuck items, not all of them.
- Do not auto-update `active.md` from a wedge proposal. The wedge sits in the briefing surface; the user uses `cos update` if they want to record progress.

## Time budget

~2 minutes of agent time. If you find yourself reading more than 5 files, you
are doing weekly work — stop and ask the user whether they want `cos weekly`
instead.
