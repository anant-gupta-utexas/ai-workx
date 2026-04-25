# weekly — 15-minute triage and dashboard refresh

Called via `cos weekly`. The main operational cadence.

## Steps

1. **Preconditions + state read.**
   - Run the SKILL.md preconditions.
   - Read `state.md` fully. Note all `last_*` dates.
   - Read `operating-contract.md` (for the self-advocacy bar used in step 9).

2. **Inbox triage (propose, don't mutate).**
   - Read `docs/00_ops/inbox/inbox.md`. For each item, suggest a destination
     using the target repo's `CLAUDE.md` routing table. Candidate destinations:
     - `docs/00_ops/tasks/active.md` (with `[area:*]` tag + due date)
     - `docs/00_ops/tasks/someday.md`
     - `docs/02_learning/raw/` (then hand off to `maintaining-wiki`)
     - `docs/03_projects/<project>/`
     - `docs/05_personal/journal/...`
     - Delete.
   - Show a table: `item → proposed destination → reason`.
   - Do not move anything yourself. Wait for user confirmation.

3. **Tasks sweep (propose).**
   - Read `docs/00_ops/tasks/active.md`.
   - Flag:
     - Overdue items (due date past).
     - Items with no `[area:*]` tag (schema violation).
     - Items older than 14 days with no progress evidence (no git touches to
       related files).
     - Items whose driver doc's status is `archived` or `maintenance`.
   - Propose: bump `last_reviewed` frontmatter to today. Move stale items to
     `someday.md` or delete.
   - Count open items per `[area:*]` tag. Save this count for the dashboard.

4. **Project drift check.**
   - For each `docs/03_projects/<project>/README.md`:
     - Read frontmatter `status`, `phase`, `last_reviewed`.
     - If `last_reviewed` > 30 days old, flag.
     - If `status` is `design` or `scaffold` for > 60 days, flag.
   - Roll up a `status → project` count for the dashboard.

5. **Sibling-repo STATUS.md sweep.**
   - For each sibling repo listed in `CLAUDE.md#sibling-repos` that ships a
     `STATUS.md` at its root, read the file's frontmatter:
     `status`, `phase`, `last_updated`, `next_gate`, `blocked_on`.
   - Expected path per repo (relative to vault root):
     `../<slug>/STATUS.md` (e.g. `../atlas/STATUS.md`, `../plumb/STATUS.md`).
   - Flag if:
     - `last_updated` > 14 days old (status may be stale).
     - `blocked_on` is non-null (surface the blocker in weekly output).
     - `status` changed since the last dashboard (`state.md` can cache
       the last-seen value under `last_sibling_status_<slug>`).
   - Roll the results into the **Project status** table in `dashboard.md`
     (step 7), replacing the vault-only `docs/03_projects/<project>/README.md`
     frontmatter as the authoritative source for repos that have a `STATUS.md`.
     Repos without a `STATUS.md` fall back to the vault project README as before.
   - Skip gracefully for any repo whose path does not exist locally.

6. **Wiki lint check — delegate.**
   - Read `docs/02_learning/log.md` (the wiki's changelog, if present).
   - If `last_wiki_lint` > 30 days old, propose running `maintaining-wiki` lint.
   - Do NOT run the lint yourself. Tell the user:
     > "Wiki lint is overdue. Run `maintaining-wiki lint` to sweep."
   - Skip gracefully if the skill is not installed.

7. **Journal coverage check.**
   - Walk the current month folder. Count daily entries present vs. elapsed
     days. Flag weeks missing a weekly review file.
   - If a `## Friction / ideas` section of a recent journal entry has a
     non-empty item, propose promoting it (to `inbox.md`, a task, or a
     `raw/` file for ingest).

7. **Regenerate `dashboard.md`.**
   - Rewrite it fully. Use this shape:

     ```markdown
     ---
     title: Dashboard (generated)
     generated_at: YYYY-MM-DD HH:MM
     generated_by: cos weekly
     ---

     # dashboard

     ## Focus
     <current_focus from state.md>
     Driver: <current_focus_driver>

     ## Cadence
     | Cadence | Last run | Status |
     | --- | --- | --- |
     | Weekly review | YYYY-MM-DD | on time / X days late |
     | ... | ... | ... |

     ## Open tasks
     | Area | Count |
     | --- | --- |
     | project:plumb | N |
     | life | N |
     | ... | ... |

     Total open: N.
     Due this week: N.

     ## Project status
     | Project | Status | Phase | Next gate | Blocked | Last updated |
     | --- | --- | --- | --- | --- | --- |
     | plumb | building | Phase 1, Week 3 | v1.0 tag | — | YYYY-MM-DD |
     | ... | ... | ... | ... | ... | ... |

     Source: `../<slug>/STATUS.md` (frontmatter) for repos that ship it;
     `docs/03_projects/<project>/README.md` frontmatter for vault-only projects.

     ## Wiki
     - Page count: N
     - Last ingest: YYYY-MM-DD
     - Last lint: YYYY-MM-DD (<status>)
     - Stale pages (last_updated > 90 days): N

     ## Inbox
     - Items: N
     - Oldest: YYYY-MM-DD
     - Last triage: YYYY-MM-DD

     ## Suggestions pending triage
     <count of suggestions in cos-suggestions.md with status=proposed>
     ```

   - Do not include per-item lists — the dashboard is counts + pointers.

8. **State.md update.**
   - Bump `last_cos_weekly` and `last_cos_daily` to today.
   - If the user approved an inbox triage in step 2, bump `last_inbox_triage`.
   - If the user approved the tasks sweep in step 3, bump the `last_reviewed`
     in `active.md`'s frontmatter (that's technically a proposal, but if
     accepted, include it).

9. **Self-advocacy — append to `cos-suggestions.md` if warranted.**
   - Read `operating-contract.md`. Check the six gates (pattern, concrete,
     cost ≤ value, not duplicate, scoped, target-known). Check the
     target-repo rubric in the same file to pick `Target:` correctly. The
     target may be `second-brain`, `ai-workx:<plugin>`,
     `ai-workx:new-plugin:<slug>`, or any sibling-repo slug listed under
     `CLAUDE.md#sibling-repos` (e.g. `portfolio`, `plumb`, `atlas`).
   - If any observation meets all six gates, append one entry per
     observation (newest at top, using the shape in `cos-suggestions.md`).
     Set `Status: proposed` and `GitHub issue: —`.
   - For each new entry whose `Target:` is **not** `second-brain` (i.e. any
     cross-repo target), also emit a **Cross-repo proposal** block in the
     weekly output so the user can file the issue without leaving the
     terminal. Resolve the target to a GitHub repo path and label set:

     | `Target:` value                       | GitHub repo                                  | Labels                                   |
     | ------------------------------------- | -------------------------------------------- | ---------------------------------------- |
     | `ai-workx:<plugin>`                   | `anant-gupta-utexas/ai-workx`                | `cos-suggestion,<plugin>`                |
     | `ai-workx:new-plugin:<slug>`          | `anant-gupta-utexas/ai-workx`                | `cos-suggestion,new-plugin,<slug>`       |
     | `portfolio`                           | `anant-gupta-utexas/anant-gupta-utexas.github.io` | `cos-suggestion`                    |
     | any other sibling slug (`plumb`, `atlas`, `slo-recommendation-engine`, `python-scaffolding`, `go-scaffolding`, `react-scaffolding`, etc.) | `anant-gupta-utexas/<slug>`                  | `cos-suggestion`                         |

     The `portfolio` alias resolves to the `anant-gupta-utexas.github.io`
     repo so the `Target:` value stays stable even if the repo is renamed.
     For any sibling slug not in the table but listed in
     `CLAUDE.md#sibling-repos`, use `anant-gupta-utexas/<slug>` with the
     `cos-suggestion` label.

     Shape of the emitted block:

     ````markdown
     ### Cross-repo proposal: <short title>

     This suggestion targets `<Target:>`. To file it as a GitHub issue, run:

     ```bash
     gh issue create \
       --repo <resolved-github-repo> \
       --title "cos-suggestion: <short title>" \
       --label <resolved-labels> \
       --body "$(cat <<'EOF'
     Source: docs/00_ops/meta/cos-suggestions.md (second-brain)
     Date: YYYY-MM-DD
     Target: <Target:>

     ### Signal
     <signal body>

     ### Proposed fix
     <proposed fix body>

     ### Cost
     <cost>
     EOF
     )"
     ```

     After the issue is created, paste the issue URL into the
     `GitHub issue:` field on the matching entry in
     `docs/00_ops/meta/cos-suggestions.md` and set `Status: promoted`.
     ````

   - **Fallback when `gh` is unavailable.** If `which gh` returns nothing (or
     the user has signaled `gh` is not set up), emit the same body as a
     plain block with a one-liner:

     > `gh` not detected. Paste the block below into a new issue at
     > `https://github.com/<resolved-github-repo>/issues/new?labels=<url-encoded-labels>`
     > then record the URL on the matching `cos-suggestions.md` entry.

   - **Never run `gh` yourself.** Drafting the command is the skill's job;
     executing it is the user's. Treat it like a proposed edit: show and wait.
   - If no observations meet the bar, do not append. Silence is fine.

10. **Compose the weekly output.**
    - Headlines (3–7 bullets).
    - Inbox triage table.
    - Tasks sweep flags.
    - Project drift flags.
    - Wiki status.
    - New `cos-suggestions.md` entries (if any). Each entry summary notes
      its `Target:`.
    - **Cross-repo proposals** (one `gh issue create` block per
      non-`second-brain` entry filed in step 9).
    - Proposed changes to non-meta files (with diff summaries).
    - List of meta files written.
    - Proposed commit message:
      ```
      cos(weekly): triage + dashboard refresh YYYY-MM-DD
      ```

11. **Stop.** Do not roll into a review. Tell the user to run `cos review` at
    end of month if they want deeper reflection.

## Anti-patterns

- Do not mutate files outside `docs/00_ops/meta/` without user approval, even
  if you're "sure" (e.g. moving an obviously stale task to someday.md). Always
  propose.
- Do not combine weekly with review in one run. They have different time
  budgets and different failure modes.
- Do not invent tasks. Every proposal must trace to an inbox item, a cadence
  miss, or an existing driver doc.
- Do not rewrite `cos-suggestions.md` — only append.
- Do not skip the dashboard regeneration. If you can't produce a number (e.g.
  wiki page count unavailable), put `—` and flag it.

## Time budget

~15 minutes of agent time. If you're going over, skip the journal coverage
check (step 7) and surface that you did.
