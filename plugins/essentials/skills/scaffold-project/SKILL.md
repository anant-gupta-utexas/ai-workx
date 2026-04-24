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

6. **Fallback when `gh` is not installed.**
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

7. **Draft the context-copy block.** After the repo is cloned, the user
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

8. **Print the next-steps checklist.** Short, language-specific, one line
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

9. **Stop.** Do not run any command yourself. Do not attempt to
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

  What's in docs/03_projects/foo-service/? I'll draft cp commands for
  the files you want in the new repo.

User: README.md, prd.md, research-pricing.md, research-batching.md.
      Skip the decision sheets.

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

  Next steps:
  - cd foo-service
  - uv sync
  - uv run pytest
  - open README.md
  - ls docs/

  Reply with the created repo URL if you'd like me to record it somewhere
  (e.g. bump `docs/03_projects/foo-service/README.md` frontmatter via
  `cos update`).
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
