# update — log completions, notes, and status shifts

Called via `cos update` (or phrases like "log what I did", "I just finished X",
"mark this task done", "capture a note", "record task completion"). The one
operation that is explicitly *write-bearing* outside `00_ops/meta/`. Still
propose-don't-mutate: every non-meta edit goes through a confirmation table.

## Steps

1. **Preconditions + state read.**
   - Run the SKILL.md preconditions (read `AGENTS.md`, `CLAUDE.md`,
     `state.md`).
   - Note `current_focus` — it helps classify items.

2. **Elicit the update (if needed).**
   - If the user's prompt already enumerates completed items / notes / status
     shifts, skip this step.
   - Otherwise ask one question: **"What got done, or what do you want to
     log?"** Wait. Do not guess.

3. **Parse items.** For each distinct item the user named, classify it into
   exactly one bucket (if ambiguous, flag it on the proposal row rather than
   guessing silently):

   | Bucket | Evidence | Target |
   | --- | --- | --- |
   | Task completion | Item matches a line in `active.md` (by title, slug, or `[area:*]` tag) | Remove from `active.md`; append to `done.md` with `— done YYYY-MM-DD`. |
   | Project status shift | User mentions a project name + new `status`/`phase`/`last_reviewed` | Edit `docs/03_projects/<project>/README.md` frontmatter only. |
   | New note / reminder | User wants to remember something not yet in the vault | Append to `docs/00_ops/inbox/inbox.md` as a new H2 item. |
   | Ops log entry | User narrates an event or decision to record operationally (not literary) | Append to today's ops note `docs/00_ops/daily/YYYY-MM-DD.md` under `## Log`. If the file doesn't exist, add a row to create it first (canonical schema in `references/daily.md`), then append the log entry. |
   | Ops win | User reports completing something worth recording as a win today | Append to today's ops note under `## Wins`. Same file-creation rule as above. |
   | Journal-only log | User wants today's personal journal to record a fact (not an ops event) | Append to today's journal file at `docs/05_personal/journal/YYYY/MM-month/DD.md` under a `## Log` section. Use this bucket only when the content is clearly literary / reflective rather than operational. When in doubt, prefer the ops note. |
   | Wiki-shaped | User describes a *learning* or *claim* worth ingesting | **Do not handle.** Route the user to `maintaining-wiki` (say so and stop on that item). |

4. **Resolve ambiguity.**
   - If a reported completion has no matching `active.md` entry, surface it:
     "no matching task — log it directly into `done.md` with `[area:?]` tag?"
     Wait.
   - If a project name doesn't exist under `docs/03_projects/`, surface it:
     "no matching project folder — skip, or create a stub README?" Wait.
   - Do not invent matches.

5. **Build the proposal table.** One row per item:

   | # | Item (verbatim from user) | Target file | Proposed change (short diff) | Reason |
   | --- | --- | --- | --- | --- |

   Keep diff summaries one line each ("move active.md:L42 → done.md:append";
   "bump `status: design` → `status: build` in project README frontmatter";
   "new inbox H2: 'Check X with Y before Z'").

6. **Show and wait.** Render the table. Ask the user to confirm "all",
   "subset (numbers)", or "edit row N". Do not write anything yet.

7. **Apply approved edits.** For each approved row, in this order:
   1. Task completions: modify `active.md` (remove or strike the line),
      append to `done.md` with `— done YYYY-MM-DD` and the original
      `[area:*]` tag preserved.
   2. Project status shifts: edit frontmatter only. Never touch body prose
      during an update run.
   3. Inbox additions: append H2 + one-line body. Include today's date on a
      separate italic line (`*captured: YYYY-MM-DD*`).
   4. Ops note appends: open `docs/00_ops/daily/YYYY-MM-DD.md`. If it does
      not exist and the user approved its creation, create it with the
      canonical schema (see `references/daily.md`). Append log entries under
      `## Log` with a timestamp prefix (`- HH:MM — <event>`). Append wins
      under `## Wins`. Never delete or rewrite existing content — the log
      section is append-only.
   5. Journal appends: open today's journal file at
      `docs/05_personal/journal/YYYY/MM-month/DD.md` (use the repo's
      existing month-name format). Append under `## Log` (create the section
      if missing).

8. **Write state.md.**
   - Bump `last_cos_update` to today.
   - Bump `last_cos_daily` too (an update implies you've looked at today).
   - Never touch other `last_*` fields.

9. **Compose the update output** using the SKILL.md "Output shape":
   - Header (operation: update, date, target repo).
   - Headlines: one bullet per approved row, past-tense ("Closed
     `auth-middleware-rewrite`", "Bumped `plumb` to `phase: build`", "Logged
     note about X").
   - Details: the proposal table, with an extra "Status" column (applied /
     skipped / rejected).
   - Proposed changes: none left (everything is either applied or the user
     already declined).
   - Cross-repo proposals: **none** from an update run (those come from
     weekly/review). If you *noticed* a pattern worth filing, mention it in a
     single sentence and suggest the user run `cos weekly`.
   - State write summary: list `state.md` plus any non-meta files edited.
   - Proposed commit message: `cos(update): log YYYY-MM-DD — <one-line
     summary>` (e.g. `cos(update): log 2026-04-22 — closed auth-middleware,
     bumped plumb to build`).
   - Next cadence: remind the user when `cos weekly` is due.

10. **Stop.** Do not roll into daily/weekly/review. An update is
    intentionally narrow.

## Anti-patterns

- **Do not invent completions.** Only log what the user said. If they said
  "I worked on X today" that is **not** a completion — it's a journal log at
  best.
- **Do not edit goals, principles, driver doc bodies, or cos-suggestions.md.**
  Those have their own cadences.
- **Do not touch `docs/02_learning/`.** That's `maintaining-wiki`'s
  territory — route the user there and stop on that item.
- **Do not skip the proposal table**, even for "obvious" single-item updates.
  Writes outside `00_ops/meta/` are always confirmed first.
- **Do not batch multiple writes into a single commit without showing
  status.** End with `git status --short` and the proposed commit message.
- **Do not mutate `active.md`/`done.md` task formatting.** Preserve
  `[area:*]` tags, due-date suffixes, and list-item style exactly.

## Time budget

~3–5 minutes of agent time. If the user is listing more than 5–6 items, ask
whether this should be a `cos weekly` instead — weekly has the full triage
machinery and produces a dashboard.

## Example flow

```
User: cos update — I finished the auth middleware rewrite and bumped plumb
      to phase build. Also want to remember to check X before Friday.

Skill:
  ## Proposal

  | # | Item | Target | Change | Reason |
  | 1 | "finished the auth middleware rewrite" | active.md → done.md | remove L42; append "- auth middleware rewrite [area:backend] — done 2026-04-22" | matches active.md:L42 |
  | 2 | "bumped plumb to phase build" | docs/03_projects/plumb/README.md | frontmatter: phase: scaffold → build; last_reviewed: 2026-04-22 | project exists |
  | 3 | "remember to check X before Friday" | docs/00_ops/inbox/inbox.md | append H2 "Check X before Friday (2026-04-24)" | new inbox item |

  Confirm all? (or pick rows, or edit)

User: all

Skill: [applies, bumps state.md, renders output, proposes commit]

  Proposed commit:
  ```
  cos(update): log 2026-04-22 — closed auth middleware, bumped plumb to build
  ```
```
