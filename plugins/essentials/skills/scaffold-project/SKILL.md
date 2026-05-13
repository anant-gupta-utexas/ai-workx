---
name: scaffold-project
description: Use when the user wants to scaffold / bootstrap a new project repository from one of the maintained language templates (python, go, react). Trigger on phrases like "scaffold a new project", "start a new python repo", "bootstrap a go project", "create a react repo from template", "spin up a new repo for <name>", "new project from template", "initialize a <lang> project", "kick off a new <lang> service", "create a repo from my <lang> scaffolding". The skill drafts a `gh repo create --template` command for the chosen language plus a follow-up local-clone step, and prints a "next steps" checklist with language-specific bootstrap hints. It never runs `gh` itself — the user executes the drafted commands. Do NOT trigger for creating files inside an existing repo, for adding a sub-package or module, or for any in-repo scaffolding (that's a plain file edit). Do NOT trigger if the user explicitly wants a non-templated empty repo. Do NOT trigger for languages not in the registry (python / go / react) — instead surface that the registry doesn't cover it.
---

# scaffold-project

## Purpose

Turn a fully-ideated project (usually something the user has sketched in
`docs/03_projects/<name>/README.md` in their second-brain vault) into a real
GitHub repo with the right language scaffolding — without manually clicking
"Use this template" on github.com.

The skill is a **drafter**, not a doer. It writes the `gh` command that
creates the repo from a template, clones it locally, drafts the `cp` commands
that copy the project's vault-side context (the README, PRD, and one or more
research notes — whichever the user names) into the new repo on top of the
template's stubs, and prints a one-line next-steps checklist. The user runs
every command explicitly. This matches the same "never mutate remote state
yourself" rule the chief-of-staff skill uses for its cross-repo issue
proposals.

The scaffolding templates themselves already ship with `CLAUDE.md`,
`README.md`, and a `docs/` directory — the skill does **not** re-initialize
those. The vault content flows in on top.

## Template registry

| Language | Template repo (on GitHub) |
| --- | --- |
| `python` | `anant-gupta-utexas/python-scaffolding` |
| `go` | `anant-gupta-utexas/go-scaffolding` |
| `react` | `anant-gupta-utexas/react-scaffolding` |

If the user asks for a language not in this table (Rust, Java, Swift, etc.),
**do not invent a template**. Tell the user the registry doesn't cover it,
point them at the table above, and stop. Adding a new template means adding
a repo to the GitHub profile first and then updating this table — that's a
separate change, not something to paper over at the call site.

## Steps

1. **Determine language.**
   - If the user named a language clearly (python / go / react), accept it.
   - If ambiguous (e.g. "start a new backend repo"), ask one clarifying
     question: "Python, Go, or React?"
   - If the named language is not in the registry, stop and surface that
     (see above).

2. **Determine project name.**
   - Expect a kebab-case slug (e.g. `order-worker`, `foo-service`).
   - If the user gave something else (spaces, snake_case, camelCase),
     normalize to kebab-case and confirm before proceeding.
   - If no name was given, ask: "What should the repo be called?"

3. **Pick visibility.** Default is `--public`. If the user hinted at
   private (`internal`, `private`, `closed-source`), use `--private`.
   Otherwise ask one question: "Public or private?" Don't assume silently —
   the wrong answer here is expensive to undo.

4. **Collect an optional description.**
   - If the user's prompt already contains a one-liner ("a worker that
     processes X"), use it.
   - Otherwise either ask, or leave `--description` off — don't stall the
     scaffolding on prose the user can add later.

5. **Draft the `gh repo create` block.** Emit exactly one fenced `bash`
   code block, ready to copy-paste:

   ```bash
   gh repo create anant-gupta-utexas/<name> \
     --template anant-gupta-utexas/<lang>-scaffolding \
     --public \
     --description "<description>" \
     --clone
   ```

   Notes:
   - `--clone` pulls the new repo to the current working directory. This
     covers the "clone locally after create" post-step in one command.
   - If the user chose private, swap `--public` for `--private`.
   - If no description was collected, drop the `--description` line entirely
     (don't emit an empty string).
   - Always use `anant-gupta-utexas/` as the owner. This skill is explicitly
     personal to Anant's GitHub profile; the template registry lives there.
     If the user asks for a different owner, surface that this skill only
     targets `anant-gupta-utexas` and stop.

6. **Inspect the cloned repo's `docs/` structure.** Before drafting any `cp`
   destination paths, read the actual directory layout of the cloned template:

   ```bash
   ls <name>/docs/
   ```

   - If the template uses a flat `docs/` (files directly under `docs/`), route
     copied files to `<name>/docs/<filename>` as shown in the destination table
     below.
   - If the template uses numbered or named subdirectories
     (`1_product_and_research/`, `2_architecture/`, etc.), map each vault file
     to the semantically matching subdir:

     | Vault file | Likely template subdir |
     | --- | --- |
     | `prd.md` | `1_product_and_research/` or similar |
     | `architecture.md` | `2_architecture/` or similar |
     | `research-*.md` | `1_product_and_research/` or similar |

   - If the structure is ambiguous (no `docs/` at all, multiple equally-plausible
     subdirs for a given file type), ask the user one question with the actual
     `ls` output pasted inline before drafting destinations.
   - Do **not** hardcode `docs/<file>` destination paths without running this
     step first. Hardcoded destinations that don't match the template are the
     friction pattern this step prevents.

   > If the repo hasn't been cloned yet (the user hasn't run the `gh` block),
   > note the destinations as provisional and mark them clearly: "These
   > destinations assume a flat `docs/`. Run `ls <name>/docs/` and let me know
   > the layout if the template uses subdirectories."

8. **Fallback when `gh` is not installed.**
   - If the user has signaled that `gh` is unavailable (or you have reason
     to believe so — e.g. the user mentions "I don't have the GitHub CLI"),
     emit the template's `/generate` URL plus the manual clone command:

     ```
     No gh detected. Create the repo via the web UI:
       https://github.com/anant-gupta-utexas/<lang>-scaffolding/generate

     Then clone locally:
     ```
     ```bash
     git clone git@github.com:anant-gupta-utexas/<name>.git
     cd <name>
     ```

   - `brew install gh` (macOS) or https://cli.github.com/ for other
     platforms — mention this only if the user asks how to unblock.

9. **Draft the context-copy block.** After the repo is cloned, the user
   usually wants the project's vault-side docs (the stuff they wrote during
   ideation — README, PRD, one or more research notes) to land in the new
   repo on top of the template stubs. Draft the `cp` commands; the user
   runs them.

   - **Source path convention.** Expect the vault-side folder to live at
     `<SECOND_BRAIN_DIR>/docs/03_projects/<name>/`. The skill does not probe
     for it — just name the convention and let the user edit the `VAULT`
     variable in the drafted block if their vault sits somewhere else.

   - **What the user moves is variable.** A vault project folder typically
     contains a `README.md` and a `prd.md`, but research is not one fixed
     filename — there can be zero, one, or many research notes with
     topic-specific titles (`research-pricing.md`, `research-prior-art.md`,
     a `research/` subdirectory, etc.). Decision sheets, ideation scratch,
     and journal fragments may also be present but usually don't belong in
     a code repo.

   - **Ask the user what to move when in doubt.** If the user hasn't told
     you what's in the vault folder, ask one consolidated question before
     drafting:

     ```
     What's in docs/03_projects/<name>/? I'll draft cp commands for the
     files you want in the new repo. Common picks:
       - README.md       → overwrites the template stub
       - prd.md          → docs/prd.md
       - any research-*.md or research/  → docs/research/ or docs/<same-name>.md
     Paste the filenames (or "everything except decision sheets", etc.).
     ```

     If the user has already told you the filenames in the prompt, skip
     the question and draft directly.

   - **Destinations.**
     | Vault file | Destination in new repo |
     | --- | --- |
     | `README.md` | `./<name>/README.md` (overwrites template stub). Project identity lives in the vault; the template's README is a placeholder. |
     | `prd.md` | `./<name>/docs/prd.md` |
     | Any `research*.md` (one or many) | `./<name>/docs/<same-filename>` — preserve the vault's titles so `research-pricing.md` stays `research-pricing.md`, not collapsed into a single `research.md`. |
     | A `research/` subdirectory | `./<name>/docs/research/` as a directory copy (`cp -R`). |

   - **What stays untouched.** `CLAUDE.md` stays as-is from the template —
     the template ships a project-scaffolding-shaped routing file, and the
     user edits it once the vault context has landed. `docs/` itself and any
     template stubs inside it stay as-is.

   - **Drafted block.** Emit exactly one fenced `bash` block, separate from
     the `gh repo create` block above (per the "don't emit multiple commands
     in one fenced block" anti-pattern). Only include lines for files the
     user confirmed exist — don't emit a failing `cp` for something that
     isn't there. Example shape with a multi-file research set:

     ```bash
     VAULT=~/second-brain/docs/03_projects/<name>
     cp "$VAULT/README.md"                ./<name>/README.md
     cp "$VAULT/prd.md"                   ./<name>/docs/prd.md
     cp "$VAULT/research-pricing.md"      ./<name>/docs/research-pricing.md
     cp "$VAULT/research-prior-art.md"    ./<name>/docs/research-prior-art.md
     ```

     If research lives in a subdirectory instead:

     ```bash
     VAULT=~/second-brain/docs/03_projects/<name>
     cp    "$VAULT/README.md" ./<name>/README.md
     cp    "$VAULT/prd.md"    ./<name>/docs/prd.md
     cp -R "$VAULT/research/" ./<name>/docs/research/
     ```

   - **Other vault artifacts (decision sheets, ideation scratch, journal
     fragments).** Do not copy them by default. If the user explicitly
     names one, add it — otherwise list them in prose as "also in the
     source folder — left in the vault; add manually if you want them in
     the repo later."

10. **Post-copy sanitization proposal.** After drafting the `cp` block,
    warn the user that vault docs often contain person names, company names,
    engagement dates, and vault-internal path fragments that don't belong
    in a public (or semi-public) repo.

    Emit this warning and offer before the user runs the `cp` commands:

    ```
    Before you run the cp block: vault docs often carry real names (founders,
    clients, team members), company/product names, engagement-specific framing,
    and vault-internal paths (docs/03_projects/…, docs/00_ops/…) that don't
    belong in a public repo.

    Want me to scan the copied files for risky patterns and draft a
    sanitization proposal? I'll grep for:
      - proper-noun clusters from the project README/PRD
      - vault-internal path fragments (docs/03_projects/, docs/00_ops/, second-brain)
      - any obvious engagement-specific dates or client identifiers

    Reply "yes, scan" and I'll draft a proposal table (what gets stripped,
    what stays, line-by-line) before any change is made. Some names
    (public collaborators, open-source maintainers) may be intentional —
    you confirm each one.
    ```

    Rules for the sanitization pass (when the user says "yes, scan"):
    - Draft the scan as a proposal table — one row per risky pattern found,
      with the line it appears on, the proposed replacement, and a rationale.
    - Never auto-sanitize silently. The user confirms each row.
    - Do not strip names that are clearly the user's own public identity
      (e.g. the repo owner's GitHub handle) — those are intentional.
    - After the user approves the table, emit the sanitized file contents as
      a fenced block. The user replaces the files manually (same "draft, don't
      execute" rule that governs the `cp` block).

    If the user skips sanitization ("no, skip"), move on. Record nothing.
    If the copied files are known to be already clean (the user says so),
    accept that and move on.

11. **Print the next-steps checklist.** Short, language-specific, one line
    per step. Use the template below (adapt to the chosen language):

    **Python:**
    ```
    Next steps:
    - cd <name>
    - uv sync                       # install deps
    - uv run pytest                 # verify scaffolding tests pass
    - open README.md                # language-specific bootstrap details
    - ls docs/                      # review vault context copied over
    ```

    **Go:**
    ```
    Next steps:
    - cd <name>
    - go mod tidy                   # resolve deps
    - go test ./...                 # verify scaffolding tests pass
    - open README.md                # language-specific bootstrap details
    - ls docs/                      # review vault context copied over
    ```

    **React:**
    ```
    Next steps:
    - cd <name>
    - pnpm install                  # install deps
    - pnpm dev                      # start dev server
    - open README.md                # language-specific bootstrap details
    - ls docs/                      # review vault context copied over
    ```

    Do not pretend to know details of the template beyond these — the
    template README is authoritative.

12. **Draft the vault `CLAUDE.md` sibling-repos update.** Once the repo URL
    is known (the user confirms the `gh` block ran and shares the URL, or it
    is derivable from the owner + name), propose adding the new repo to the
    vault's `CLAUDE.md` sibling-repos table so the chief-of-staff and all
    agents know the repo exists.

    Emit the proposal as a named diff (not a command to run):

    ```
    Add to CLAUDE.md #sibling-repos table (vault edit — confirm before applying):

    | [`<name>`](https://github.com/anant-gupta-utexas/<name>) | `../<name>` | <one-line purpose> | Code, README, config go there. Plans, decisions, research, and task tracking stay in `docs/03_projects/<name>/`. |
    ```

    Rules:
    - The vault path column is always `../<name>` (sibling to the vault under
      `~/PycharmProjects/` or equivalent — use whatever parent the user's
      vault sits in).
    - The "What lives there" cell comes from the project description the user
      gave in Step 4. Keep it to one sentence.
    - The "Routing rule" cell follows the same pattern as existing sibling
      entries: code and repo-level docs go to the sibling repo; vault-side
      plans, decisions, and task tracking stay in `docs/03_projects/<name>/`.
    - Do **not** write to the vault yourself. This is a proposal the user
      confirms; they (or `cos update`) apply the edit.
    - If the repo URL is not yet known (the user hasn't confirmed the `gh`
      block ran), note that the CLAUDE.md update is pending the URL and
      remind the user to reply with it.

13. **Propose vault hub reduction.** After the cp block, tell the user that
   the vault folder should now shrink to hub-only shape — its operational
   docs (PRD, research, scoping notes) have migrated to the sibling repo and
   the vault copy should become a status pointer, not a duplicate.

   Emit this as a named proposal (not a command to run):

   ```
   Once the repo is confirmed, reduce docs/03_projects/<name>/README.md to
   hub-only shape and delete the migrated files from the vault folder.
   Reply with the repo URL and I'll draft the cos update to do this.
   ```

   The canonical hub shape for the vault README is:

   ```markdown
   ---
   title: <name> — <one-line purpose>
   status: design | active | paused | complete | deferred
   phase: <current phase>
   repo: https://github.com/anant-gupta-utexas/<name>
   last_reviewed: YYYY-MM-DD
   ---

   # <name>

   <one-line purpose>

   ## Status

   <current focus / phase summary>

   ## Repository

   [anant-gupta-utexas/<name>](https://github.com/anant-gupta-utexas/<name>)

   ## Operational docs

   PRD, research, and design notes live in the repo at <destination-dir>/.

   ## Cross-references

   *(vault-internal links only — overall plan, meta docs, cos-suggestions)*
   ```

   Files to delete from the vault folder after migration: everything that
   was copied into the repo (PRD, research notes, scoping docs). Only
   `README.md` (hub-shaped) should remain, plus a `decisions/` folder if
   the user has vault-side ADRs that didn't migrate.

   Do not execute any of this. The hub reduction happens via `cos update`
   after the user confirms the repo URL.

14. **Stop.** Do not run any command yourself. Do not attempt to
    `git clone`, `gh auth status`, `cp` the vault files, or otherwise touch
    the filesystem or network.

## Anti-patterns

- **Don't run `gh` yourself.** Always draft; user executes. Even if the
  command looks safe, running remote-mutating commands on the user's behalf
  breaks the "propose, don't mutate cross-repo" pattern used elsewhere in
  this marketplace.
- **Don't assume visibility.** Ask, or use an explicit user signal. Public
  and private repos have different downstream consequences (org policies,
  secrets, CI minutes).
- **Don't invent a template for a language not in the registry.** Surfacing
  the gap is more useful than shipping an empty repo the user then has to
  delete.
- **Don't pre-create the local directory.** `gh repo create --clone`
  handles that in one step. Pre-creating it means the clone lands inside
  the pre-created dir or errors out.
- **Don't emit multiple commands in one fenced block.** Keep `gh repo
  create` in its own block so the user can copy-paste without reading every
  line. Next-steps go in a separate plain-text block.
- **Don't modify the template repos.** If the user wants a change
  ("add black config to python-scaffolding"), that's a separate edit to
  the template repo, not a per-project tweak.
- **Don't copy vault files yourself.** Draft the `cp` block; the user
  runs it. Same contract as `gh repo create` — the skill never touches
  the filesystem on the user's behalf.
- **Don't re-initialize `CLAUDE.md`, `README.md`, or `docs/`.** The
  scaffolding template already ships all three. The skill only drafts the
  copy of vault content *on top of* the template — it does not generate
  a fresh `CLAUDE.md`, synthesize a project README from scratch, or
  scaffold `docs/` with stubs. If the template is missing one of these,
  that's a fix to the template repo, not to this skill.
- **Don't bulk-copy the vault folder.** A bare `cp -r "$VAULT/." .`
  drags in decision sheets, ideation scratch, and journal fragments that
  belong in the vault. Enumerate files explicitly (or the user-named
  subdirectory like `research/`), one `cp` line per artifact.
- **Don't assume there's exactly one research doc.** Research notes are
  topic-named (`research-pricing.md`, `research-prior-art.md`) or live
  under a `research/` subdirectory. Don't collapse them into a single
  `docs/research.md` and don't skip the ones beyond the first. When the
  vault contents aren't visible to you, ask.
- **Don't rename files on copy.** Preserve the vault's filenames in the
  new repo's `docs/` — `research-pricing.md` stays `research-pricing.md`.
  Renaming breaks the mental link back to the vault-side doc and forces
  the user to reconcile names later.
- **Don't hardcode `docs/<file>` cp destinations without inspecting the
  template first.** Always run `ls <name>/docs/` (Step 6) before drafting
  destination paths. Templates may use numbered subdirectories; hardcoded
  flat paths break silently and force mid-session course corrections.
- **Don't skip the sanitization warning.** Every scaffold session that
  copies vault docs into a public (or semi-public) repo must emit the
  sanitization offer (Step 10). Vault docs routinely carry person names,
  company names, and vault-internal paths that don't belong in public
  repos. Skipping the warning shifts the cost onto the user.
- **Don't auto-sanitize silently.** If the user asks for a sanitization
  scan, produce a proposal table and wait. Never strip content without
  explicit per-row confirmation.
- **Don't write the vault `CLAUDE.md` yourself.** Draft the sibling-repos
  table row (Step 12) as a proposal. The user applies it (or delegates to
  `cos update`). Same "propose, don't mutate" rule as the `cp` block.
- **Don't skip the `CLAUDE.md` sibling-repos proposal.** Every new repo
  scaffolded via this skill should be registered in the vault's routing
  table. If the repo URL isn't known yet, emit the pending reminder; don't
  silently omit the step.
- **Don't skip the hub-reduction proposal.** Every scaffold ends with a
  prompt to reduce the vault folder to hub-only shape (Step 13). The
  operational docs now live in the sibling repo; leaving duplicates in the
  vault is the failure mode this step prevents. Even if the user doesn't
  act on it immediately, the proposal must appear.

## Example flows

### Happy path

```
User: scaffold a new python project called foo-service, private, for running
      background data jobs

Skill:
  Language: python (from registry).
  Name: foo-service (kebab-case, OK).
  Visibility: private (user said "private").
  Description: "Background data job runner"

  Run this to create the repo and clone it locally:

  ```bash
  gh repo create anant-gupta-utexas/foo-service \
    --template anant-gupta-utexas/python-scaffolding \
    --private \
    --description "Background data job runner" \
    --clone
  ```

  Once cloned, run `ls foo-service/docs/` and paste the output so I can
  route the vault files to the right subdirectories. (If the template uses
  a flat docs/, the cp block below is provisional and already correct.)

  What's in docs/03_projects/foo-service/? I'll draft cp commands for
  the files you want in the new repo.

User: README.md, prd.md, research-pricing.md, research-batching.md.
      Skip the decision sheets. docs/ is flat.

Skill:
  The template already ships `CLAUDE.md`, `README.md`, and `docs/` —
  this overwrites the stub README with the vault's project-identity
  README and drops the PRD plus both research notes into `docs/` with
  their original filenames. `CLAUDE.md` stays as-is from the template:

  ```bash
  VAULT=~/second-brain/docs/03_projects/foo-service
  cp "$VAULT/README.md"             ./foo-service/README.md
  cp "$VAULT/prd.md"                ./foo-service/docs/prd.md
  cp "$VAULT/research-pricing.md"   ./foo-service/docs/research-pricing.md
  cp "$VAULT/research-batching.md"  ./foo-service/docs/research-batching.md
  ```

  Before you run the cp block: vault docs often carry real names, company
  names, and vault-internal paths (docs/03_projects/…) that don't belong
  in a public repo. Want me to scan the copied files for risky patterns
  and draft a sanitization proposal? Reply "yes, scan" or "no, skip".

User: no, skip

Skill:
  Next steps:
  - cd foo-service
  - uv sync
  - uv run pytest
  - open README.md
  - ls docs/

  Add to CLAUDE.md #sibling-repos table in your vault (confirm before applying):

  | [`foo-service`](https://github.com/anant-gupta-utexas/foo-service) | `../foo-service` | Background data job runner. | Code, README, config go there. Plans, decisions, research, and task tracking stay in `docs/03_projects/foo-service/`. |

  Once the repo is confirmed, reduce docs/03_projects/foo-service/README.md
  to hub-only shape and delete the migrated files from the vault folder.
  Reply with the repo URL and I'll draft the cos update to do this.
```

### Ambiguous language

```
User: spin up a new repo called order-worker

Skill: Which template — python, go, or react?
```

### Out-of-registry language

```
User: bootstrap a rust project called fast-relay

Skill:
  The template registry covers python, go, and react only — there's no
  `rust-scaffolding` repo on `anant-gupta-utexas`. To scaffold a Rust
  project, either:
    1. Create `anant-gupta-utexas/rust-scaffolding` on GitHub first, then
       add it to the skill's registry, or
    2. Bootstrap manually with `cargo new fast-relay` and skip the template.
  No action taken.
```
