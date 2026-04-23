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
creates the repo from a template, clones it locally, and prints a one-line
next-steps checklist. The user runs the command explicitly. This matches the
same "never mutate remote state yourself" rule the chief-of-staff skill uses
for its cross-repo issue proposals.

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

7. **Print the next-steps checklist.** Short, language-specific, one line
   per step. Use the template below (adapt to the chosen language):

   **Python:**
   ```
   Next steps:
   - cd <name>
   - uv sync                       # install deps
   - uv run pytest                 # verify scaffolding tests pass
   - open README.md                # language-specific bootstrap details
   ```

   **Go:**
   ```
   Next steps:
   - cd <name>
   - go mod tidy                   # resolve deps
   - go test ./...                 # verify scaffolding tests pass
   - open README.md                # language-specific bootstrap details
   ```

   **React:**
   ```
   Next steps:
   - cd <name>
   - pnpm install                  # install deps
   - pnpm dev                      # start dev server
   - open README.md                # language-specific bootstrap details
   ```

   Do not pretend to know details of the template beyond these — the
   template README is authoritative.

8. **Stop.** Do not run any command yourself. Do not attempt to
   `git clone`, `gh auth status`, or otherwise touch the network.

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

  Next steps:
  - cd foo-service
  - uv sync
  - uv run pytest
  - open README.md

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
