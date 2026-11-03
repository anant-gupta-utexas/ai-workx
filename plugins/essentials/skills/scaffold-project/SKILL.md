---
name: scaffold-project
description: Use when the user wants to scaffold / bootstrap a new Python project from the maintained Copier template (python-scaffolding). Trigger on phrases like "scaffold a new project", "start a new python repo", "bootstrap a python service", "create a project from my scaffolding", "spin up a new repo for <name>", "new project from template", "initialize a python project", "kick off a new FastAPI service", "new data science project", "new CLI tool". The skill asks any missing questions (flavor, name, description), then runs a non-interactive `uvx copier copy` command for the chosen flavor (library_cli / service / datascience) and prints a "next steps" checklist. Because generation writes files, runs `uv sync`, and executes trusted post-generation tasks, running it surfaces an approval prompt the user approves directly; the agent always passes every answer via `--data`/`--defaults` so the command never blocks on an interactive prompt. Do NOT trigger for creating files inside an existing repo, for adding a sub-package or module, or for any in-repo scaffolding (that's a plain file edit). Do NOT trigger for non-Python ecosystems (Go, JavaScript/React, Rust, Java, etc.) — this template is Python-only; surface that and stop. Do NOT trigger if the user explicitly wants a non-templated empty repo.
---

# scaffold-project

## Purpose

Turn a fully-ideated project into a real Python repo with the directory
structure, planning workflow, `uv` setup, and quality gate from the maintained
scaffolding template — without hand-assembling any of it.

The scaffolding is a [Copier](https://copier.readthedocs.io) template:
[`python-scaffolding`](https://github.com/anant-gupta-utexas/python-scaffolding).
Copier *generates a local project directory* (it does **not** create a GitHub
repo). It writes the files for the chosen flavor and runs a handful of trusted
post-generation tasks (`git init`, `uv sync`, and — for the data science
flavor — `nbstripout --install`). Nothing is committed for you.

The skill is a **collaborative executor**. It asks the user any questions it
needs (flavor, name, description), assembles a **non-interactive**
`uvx copier copy` command — every answer supplied via `--data` plus
`--defaults`, so Copier never blocks waiting on a prompt the agent can't
answer — and runs it. Generation writes files, runs `uv sync` (network), and
executes `--trust` post-generation tasks, so the run surfaces an approval prompt
in the user's environment; the user approves it directly, and that approval is
the confirmation gate. If the user would rather run it themselves, hand over the
exact command instead of executing it.

## Configuration

- **Template source:** `gh:anant-gupta-utexas/python-scaffolding` (Copier's
  shorthand for `https://github.com/anant-gupta-utexas/python-scaffolding.git`).
  If the template moves, replace this single value in the command. Nothing else
  in this skill changes.
- **Version:** Copier uses the template's latest release tag (`v0.1.0`, …) by
  default. Pass `--vcs-ref <tag>` only if the user wants to pin an older release.
- **Private package index (optional).** `uvx` runs the post-generation `uv sync`
  *outside* any project, so it sees only the shell's own `uv` configuration. If
  the user's network blocks public PyPI and requires a mirror, set
  `UV_DEFAULT_INDEX=<mirror-url>` (and `UV_SYSTEM_CERTS=1` if the network
  re-signs TLS) inline on the same command. On a normal network, set nothing.

## Flavors

This template is Python-only. There is one template, selected by a `flavor`
question — there is no per-language template repo.

| Flavor (`--data flavor=`) | What you get |
| --- | --- |
| `library_cli` | `argparse` entry point (`cli.py`, `python -m`, `[project.scripts]`) |
| `service` | FastAPI + Clean Architecture (`domain`/`application`/`infrastructure`), `pydantic-settings`, domain-error → HTTP mapping, Dockerfile, compose, `.env.example` |
| `datascience` | `ingest`/`features`/`models`, gitignored `data/` with a `paths` helper, `notebooks/` with `nbstripout`, pandas/duckdb/pyarrow |

Every flavor also ships:

- `uv` with a `src/` layout, hatchling, `.python-version`
- `scripts/check.sh`, the single quality gate: ruff lint + format,
  `mypy --strict`, size limits (400 lines warn / 800 max per file, 50 per
  function), secret scan, and pytest with a coverage floor
- `.github/workflows/ci.yml`, which runs the same `scripts/check.sh` on every
  push and pull request once the repo is on GitHub
- `AGENTS.md` (with `CLAUDE.md` importing it) and `STATUS.md`
- a `docs/00_research … 04_testing` tree indexed by `docs/README.md`
- `dev/active|archive` with plan/context/tasks templates
  (`scripts/new_feature.sh <name>` scaffolds a feature's planning docs)

If the user asks to scaffold a **non-Python** project (Go, React/JS, Rust, Java,
Swift, …), **do not invent a template**. Tell them this scaffolding is
Python-only, point at the three flavors above, and stop. Adding another
ecosystem is a separate effort (a new template repo), not something to paper
over here.

## Questions Copier asks

Each of these must be supplied via `--data <key>=<value>` so the command can run
non-interactively; `--defaults` fills in any you don't set. Ask the user for the
ones that aren't obvious from their request; accept the defaults for the rest.

| Question | Default | Effect |
| --- | --- | --- |
| `project_name` | `My Project` | Titles, docs |
| `package_name` | derived from `project_name` (lowercased, underscores) | `src/<package_name>/`, distribution name |
| `description` | placeholder | `pyproject.toml`, README, `AGENTS.md` |
| `flavor` | `library_cli` | Which files and dependencies you get (see table above) |
| `python_version` | `3.13` | `.python-version`, ruff, mypy, Docker image (choices: `3.13`, `3.12`, `3.11`) |
| `min_coverage` | `80` | Coverage floor enforced by `scripts/check.sh` (0–100) |

Answers are saved in the generated project's `.copier-answers.yml`, which
`copier update` reads later.

## Steps

1. **Determine the flavor.**
   - If the user's intent is clear, map it: "CLI" / "library" → `library_cli`;
     "service" / "API" / "FastAPI" / "web backend" → `service`; "data science"
     / "notebooks" / "ML" / "analysis" → `datascience`.
   - If ambiguous (e.g. "start a new python repo"), ask one question:
     "Library/CLI, service, or data science?"
   - If the user names a non-Python ecosystem, stop and surface that (see
     above).

2. **Determine the project name and description.**
   - `project_name` is the human-readable name (e.g. `Order Worker`); the
     destination directory and `package_name` derive from it. Confirm the
     destination directory as a kebab-case slug (e.g. `order-worker`) and the
     package as a snake_case name (e.g. `order_worker`) if it isn't obvious.
   - If no name was given, ask: "What should the project be called?"
   - Let Copier derive `package_name` from `project_name` unless the user wants
     a specific importable name — then pass `--data package_name=<snake_case>`.
   - If the request already contains a one-liner ("a worker that processes X"),
     pass it as `description`. Otherwise ask once, or leave the placeholder —
     don't stall the scaffold on prose the user can add later.

3. **Pick the destination directory.** Copier's final positional argument is the
   directory it creates and fills. Default to the kebab-case slug in the current
   working directory (e.g. `order-worker`). Do not pre-create it — Copier makes
   it.

4. **Recap the plan, then run the command (non-interactively).** State the
   choices in one line (flavor, project name, destination), then run
   `uvx copier copy`. Two hard rules when running it:
   - **Always non-interactive.** Pass every answer via `--data` and add
     `--defaults` for the rest. Running a bare `copier copy` blocks on
     interactive prompts the agent cannot answer — never run it that way.
   - **`--trust` is required.** Without it Copier refuses to run its
     post-generation tasks (`git init`, `uv sync`, `nbstripout`) and the project
     arrives without an environment.

   The run writes files and fetches packages, so the user's environment asks
   them to approve the command. That approval *is* the confirmation gate — a
   separate yes/no first is not needed. If the user would rather run it
   themselves, hand over the same command instead of executing it.

   ```bash
   uvx copier copy --trust --defaults \
     --data project_name="Order Worker" \
     --data flavor=service \
     --data description="Processes background order jobs" \
     gh:anant-gupta-utexas/python-scaffolding \
     order-worker
   ```

   If `uv sync` fails to resolve packages because the network requires a
   private package index, rerun with the index set inline (see Configuration):

   ```bash
   UV_DEFAULT_INDEX=<mirror-url> UV_SYSTEM_CERTS=1 \
   uvx copier copy --trust --defaults ... gh:anant-gupta-utexas/python-scaffolding order-worker
   ```

   If the destination directory already exists and isn't empty, Copier refuses
   to overwrite; add `--overwrite` only after the user confirms they want to
   generate on top of existing files.

5. **Report what Copier did — and did not — do.** It ran `git init -q -b main`,
   `uv sync`, and (data science only) `nbstripout --install`. It did **not**
   create a commit, and it did **not** create or push a GitHub repo. Remote
   creation is a separate step (Step 8).

6. **Offer the next steps — and run the ones the user wants.** Show the
   checklist, then offer to run the quality gate and (only on explicit
   confirmation) make the first commit. Each is a separate action the user
   approves; never commit without explicit confirmation.

   ```
   Next steps:
   - cd <project-dir>
   - scripts/check.sh                 # the quality gate — must pass before every commit
   - git add -A && git commit -m "chore: scaffold from python-scaffolding"
   - open AGENTS.md, then docs/README.md
   - scripts/new_feature.sh <feature> # scaffold a feature's plan/context/tasks docs
   ```

   Do not invent other template details — `AGENTS.md` and `docs/README.md` in
   the generated project are authoritative.

7. **(Optional) Bring existing planning docs into the generated `docs/` tree.**
   If the user already wrote planning docs during ideation (a PRD, research
   notes, a system design) and wants them in the repo, copy them onto the
   matching stubs. The agent can run the copies (the user approves the file
   operations); confirm what to copy first.

   | Planning doc | Destination in the generated project |
   | --- | --- |
   | PRD | `<project-dir>/docs/01_product/PRD.md` (overwrites the stub) |
   | UI/UX design specification | `<project-dir>/docs/01_product/<same-filename>` |
   | Research note(s) | `<project-dir>/docs/00_research/<same-filename>` (the dir ships empty) |
   | System / architecture design | `<project-dir>/docs/02_architecture/SYSTEM_DESIGN.md` (overwrites the stub) |
   | Technical requirements | `<project-dir>/docs/02_architecture/TRD.md` (overwrites the stub) |

   - Preserve the source filenames for research notes (one copy per note; don't
     collapse many into one `research.md`).
   - Add a row to `docs/README.md` for every doc that isn't already indexed
     there (research notes, design specs). The generated index is the single
     entry point to `docs/`, and the template's rule is that new docs get a row.
   - `README.md` is generated from `description`; only overwrite it if the user
     has a richer project-identity README to bring in.
   - **Sanitization caution.** If these docs will land in a repo that goes
     public, warn the user that planning docs often carry real names, internal
     paths, and engagement-specific framing that don't belong in a public repo.
     Offer to scan the copied files and propose redactions (one proposed change
     per line, user confirms each) before anything ships. Never strip content
     silently.

8. **(Optional) Create a remote repo.** Copier only makes a local project. If
   the user wants it on GitHub, confirm the owner and visibility (public or
   private — the wrong choice is expensive to undo), then run:

   ```bash
   cd <project-dir>
   gh repo create <owner>/<project-dir> --private --source . --push
   ```

   Swap `--private` for `--public` per the user's answer. `--push` needs the
   first commit from Step 6; if there isn't one yet, offer it first. Once
   pushed, the generated CI workflow runs `scripts/check.sh` on GitHub Actions.
   Creating and pushing a remote repo mutates remote state, so the run surfaces
   an approval prompt the user approves directly.

9. **(Optional) Register in a project hub.** If the user tracks projects in a
   hub repo (a second-brain vault or workspace with a sibling- or linked-repos
   table in its `CLAUDE.md`), propose a row for the new repo matching the hub's
   existing table shape. Plans, decisions, and tracking stay in the hub's
   project folder (e.g. `docs/03_projects/<slug>/`). If planning docs moved into
   the repo in Step 7, also propose reducing that hub folder to a short status
   pointer (status, phase, repo link) so the docs don't live in two places. The
   user reviews and approves each edit as a diff before it lands; follow any
   hub-specific "propose, then apply" or commit-confirmation rules the hub sets.

10. **Updating a generated project later.** When the template improves, a
    project pulls the changes in. Mention this when relevant; run it only if the
    user asks and the tree is clean:

    ```bash
    cd <project-dir> && git status   # tree must be clean
    uvx copier update --trust
    ```

    Copier does a three-way merge between the old template, the new template,
    and the project's edits. Releases are git tags on the template repo
    (`v0.1.0`, …); `copier update` follows them.

11. **Wrap up.** Summarize what now exists: the generated directory, the flavor,
    whether the gate passed, whether a commit or remote repo was made, and the
    obvious next action. Offer the remaining optional steps the user skipped.

## Anti-patterns

- **Don't run Copier interactively.** Always pass every answer via `--data` and
  add `--defaults`. A bare `copier copy` blocks on prompts the agent can't
  answer and the run hangs. Interactivity — not the act of running — is the
  thing to avoid.
- **Don't drop `--trust`.** Without it, Copier refuses to run the post-generation
  tasks (`git init`, `uv sync`, `nbstripout`), and the project arrives without an
  environment. The template documents `--trust` as required.
- **Don't set a package-index override by default.** `UV_DEFAULT_INDEX` and
  `UV_SYSTEM_CERTS` are only for networks that block public PyPI. Add them
  after a resolution failure or when the user says their network needs a
  mirror — never as a reflex.
- **Don't commit without explicit confirmation.** Generation never commits.
  Making the first commit (Step 6) is a distinct action the user must approve;
  never fold it into the scaffold silently.
- **Don't invent a template for a non-Python ecosystem.** This scaffolding is
  Python-only with three flavors. Surfacing the gap is more useful than shipping
  something that doesn't exist.
- **Don't confuse scaffolding with repo creation.** `copier copy` makes a local
  directory only — no commit, no GitHub repo. Remote creation (Step 8) is a
  separate, confirmed step; don't imply one command does both.
- **Don't pre-create the destination directory.** Copier creates it. A
  pre-existing non-empty directory makes Copier refuse (or needs an explicit
  `--overwrite` the user approved).
- **Don't re-initialize `AGENTS.md`, `CLAUDE.md`, `STATUS.md`, or `docs/`.** The
  template ships all of them. The skill only copies *existing planning docs on
  top of* the generated stubs — it does not synthesize these files. If the
  template is missing something, that's a fix to the template repo, not to this
  skill.
- **Don't bulk-copy a planning folder.** Copy files explicitly (one per
  artifact) so ideation scratch, decision sheets, and journal fragments stay out
  of the code repo.
- **Don't rename files on copy.** Preserve source filenames (a research note
  keeps its name) so the mental link back to the planning doc survives.
- **Don't skip the sanitization caution for a repo that will go public.**
  Planning docs routinely carry names, internal paths, and engagement framing.
  Offer the scan; never strip content silently or without per-line confirmation.
- **Don't modify the template repo from here.** If the user wants a change to
  the scaffolding itself ("add ruff rule X", "change the Dockerfile base
  image"), that's an edit to `python-scaffolding`, not a per-project tweak at
  the call site.

## Example flows

### Happy path (service)

```
User: scaffold a new python service called order-worker that processes
      background order jobs

Skill:
  Flavor: service (FastAPI + Clean Architecture).
  Project name: Order Worker  →  directory order-worker, package order_worker.

  Generating now — approve the command when your environment prompts:

  [runs]
  uvx copier copy --trust --defaults \
    --data project_name="Order Worker" \
    --data flavor=service \
    --data description="Processes background order jobs" \
    gh:anant-gupta-utexas/python-scaffolding \
    order-worker

  Done. order-worker/ is generated; `git init` and `uv sync` ran. No commit or
  GitHub repo yet.

  Want me to run scripts/check.sh to verify the gate passes? And should I make
  the first commit and/or create a GitHub repo?
```

### CLI with planning docs to bring in

```
User: start a new python CLI called tidy-logs; bring in my PRD and the two
      research notes from the planning folder

Skill:
  Flavor: library_cli.  Project name: Tidy Logs  →  tidy-logs, package tidy_logs.

  [runs]
  uvx copier copy --trust --defaults \
    --data project_name="Tidy Logs" \
    --data flavor=library_cli \
    gh:anant-gupta-utexas/python-scaffolding \
    tidy-logs

  Generated. Copying: PRD → docs/01_product/PRD.md, research-formats.md and
  research-prior-art.md → docs/00_research/ (names kept), plus two rows in
  docs/README.md. Approve the file operations when prompted.

  Will this repo be public? If so, the copied docs can be scanned for names
  and internal paths first.
```

### Ambiguous flavor

```
User: spin up a new python repo called metrics-box

Skill: Which flavor — library/CLI, service, or data science?
```

### Non-Python ecosystem (out of scope)

```
User: bootstrap a go service called fast-relay

Skill:
  This scaffolding is Python-only (Copier template with library_cli / service /
  datascience flavors) — there's no Go template here. For Go, bootstrap manually
  (`go mod init`) or use a Go-specific template. No action taken.
```
