# Optional Colloquium HTML/PDF

Use only for requested HTML/PDF output. The adapter pins Colloquium to evaluated
revision `f22ab9bf4328482e4555bdd4ae85734e69e0f116`; the checkout reports 0.3.0 but
contains later commits than that tag. Its own Python manifest/lock/environment
is separate from Node/pele and optional art. It neither installs nor invokes
diagram rendering. No browser or Python setup is required for clean SVG.

## Workspace and source preparation

Prepare these files in the consumer workspace:

```text
brief.md                 # audience, message, beats, evidence and output
slides.md                # Colloquium Markdown/YAML, when making slides
DESIGN.md                # style decisions and diagram policy, when useful
handoff.md               # presentation/template/editability needs, when useful
assets/                  # all local images, .mmd, CSS, fonts and .bib sources
```

Use actual files, not symlinks. The output bundle must be separate from this
workspace and absent or empty; choose a new output directory for another run.
The adapter preserves source bytes and never overwrites an existing bundle.

Write ordinary Colloquium YAML frontmatter and `---` slide separators. For a
diagram, run the sibling `diagram` skill first and embed the rendered asset:

```markdown
---
title: Queue recovery
custom_css: assets/theme.css
---

## Queue processing

![Queue processing](assets/queue.svg)

---

## Recovery

Retry a failed job; inspect work that exhausts its retries.
```

Mermaid fences are rejected because upstream displays them as code. Use
`<!-- notes: ... -->` for relevant sources/assumptions. Put local stylesheets,
bibliography and image paths under `assets/`; keep references relative to the
bundle. This adapter supports the default theme plus local custom CSS;
alternative theme engines are outside its tested contract.
Custom CSS is inlined by upstream, so URLs inside inlined CSS resolve
from the HTML directory. Plain Markdown does not translate a PowerPoint theme;
`pptx`/`template` frontmatter is rejected on this route.

## Setup and invocation

Set `BRIEF_DIR` to this skill's installed directory and `DECK_WORKSPACE` and
`DECK_BUNDLE` to separate absolute source/output directories. Source-only
packaging needs Python 3.11+ standard library, with no backend installation:

```sh
python3 "$BRIEF_DIR/scripts/colloquium/adapter.py" --workspace "$DECK_WORKSPACE" --out "$DECK_BUNDLE" --format source
```

For HTML/PDF, install only this optional environment:

```sh
uv sync --project "$BRIEF_DIR/scripts/colloquium" --frozen --no-dev
uv run --project "$BRIEF_DIR/scripts/colloquium" --frozen --no-dev python "$BRIEF_DIR/scripts/colloquium/adapter.py" --workspace "$DECK_WORKSPACE" --out "$DECK_BUNDLE" --format html
```

For PDF, replace `--format html` with `--format pdf --capture`. A compatible
system Chromium browser is required. `--capture-engine auto` uses native
Colloquium capture with Ghostscript when available, then Poppler if needed.
`--capture-engine poppler` uses `pdftoppm` on the produced PDF; `native` requires
Ghostscript and does not silently switch capture engines. No browser is
downloaded or installed automatically. Inspect every generated page preview.

The adapter writes `slides.html`, optional `slides.pdf`, optional `previews/`
and `render-report.json` alongside copied sources/assets. Failed export returns
nonzero and records completed stages, warnings and the unfinished request.
Missing Chromium may leave HTML, but does not count as PDF success.

## Packaging and review limits

Keep `assets/` beside HTML. The adapter checks local HTML/CSS/SVG resource paths
and reports direct external resource URLs, including upstream CDNs and fonts.
It does not download remote assets, resolve transitive/dynamic network requests
or prove offline operation. `srcset` is unsupported; use a single `src` asset.
The report's `visually_reviewed` stays false; file checks do not replace the
agent's browser/page inspection.

If setup is missing, retain brief/slide sources and assets, explain the failed
stage, and report the required optional setup. Do not change format or install
PowerPoint/art extras. Treat actual upstream warnings as evidence to investigate,
especially unresolved citations or missing assets.
