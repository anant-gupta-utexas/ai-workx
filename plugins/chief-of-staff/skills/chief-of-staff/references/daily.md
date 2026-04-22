# daily — 2-minute snapshot

Called via `cos daily`. Fast. Read-only except for one state.md bump.

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

6. **Compose headlines (3–7 bullets max).**
   - Obey notification policy in `operating-contract.md`. Only surface:
     - Items due today/tomorrow (max 3).
     - One "next action" tied to `current_focus`.
     - At most one overdue-cadence flag (the most severe).
     - Journal-missing flag, iff today's past 9pm local.
     - Git dirty flag, iff non-obvious (e.g. half-staged changes).
   - Do not list every task. Do not recount the inbox if it was triaged today.

7. **Output the snapshot** using the "Output shape" from SKILL.md.

8. **Write state.md.**
   - Bump `last_cos_daily` to today's date.
   - No other writes.

9. **Propose commit.**
   - If only state.md changed, propose:
     ```
     cos(daily): snapshot YYYY-MM-DD
     ```
   - If the user accepted other edits during the run (rare), update the message
     to reflect them.

10. **Stop.** Do not run weekly work.

## Anti-patterns

- Do not read the full wiki or project READMEs during a daily. That's weekly/review work.
- Do not regenerate the dashboard on a daily. It stays whatever `cos weekly` produced.
- Do not triage the inbox on a daily. Flag it and stop.
- Do not nag. If the user ran `cos daily` twice in one day, just return a short "nothing new since <HH:MM>".

## Time budget

~2 minutes of agent time. If you find yourself reading more than 5 files, you
are doing weekly work — stop and ask the user whether they want `cos weekly`
instead.
