# Visual Skills

Visual briefs, Mermaid sources and portable diagrams. Version 0.2.0 ships two
skills: `diagram` and `visual-brief`. Clean SVG is the default, with optional
hand-drawn states and a separate Colloquium HTML/PDF backend.
It installs independently of essentials; neither plugin requires the other.
The repo's root `plugin.json` is also exposed through
`.claude-plugin/plugin.json` as a relative symlink for Claude Code discovery.

```text
/plugin install visual-skills@ai-workx
```

Ask for a flowchart, sequence, ER or state diagram, or provide a `.mmd` file.
The diagram skill keeps the source and renders a separate asset. Ask for a deck
brief or visual presentation to use `visual-brief`: it prepares the message,
beats, style, evidence and assets before selecting the requested export route.
PowerPoint/Google Slides stay on the host's existing presentation workflow.
No state model checker, PowerPoint engine or Figma integration is bundled.

## Setup and usage

Node 24 or later and npm are required for rendering. Set `DIAGRAM_DIR` to the
installed plugin's `skills/diagram` directory (or that directory in this checkout).
Plugin installation discovers the skill; it does not install npm packages.

```sh
npm ci --prefix "$DIAGRAM_DIR/scripts" --ignore-scripts
node "$DIAGRAM_DIR/scripts/render.mjs" --mmd chart.mmd --out output/chart.svg
```

Core installs only `pele@1.9.0`; it uses no browser, canvas, rasterizer, bundled
art font or Python. Flowchart/subgraph, sequence, ER/cardinality and flat-state
fixtures are tested, including state start/end markers. Other syntax needs
separate validation. Output uses literal theme colors and Arial.

Art is opt-in and has separate dependencies:

```sh
npm ci --prefix "$DIAGRAM_DIR/scripts/art" --ignore-scripts
node "$DIAGRAM_DIR/scripts/render.mjs" --mmd chart.mmd --out output/chart.png --style hand-drawn --fast
```

Only flat state diagrams are supported by art. Unsupported markers/annotations
are rejected rather than dropped. See [art setup and limits](skills/diagram/references/art.md)
and [third-party notices](skills/diagram/NOTICE.md).

Put these exact lines in the project's `DESIGN.md` to disable art:

```text
Default diagram style: clean
Hand-drawn support: disabled
```

The nearest `DESIGN.md` above the input applies; `--design path` selects another
file. Set support to `enabled` to allow art, while retaining the clean default.
`Default diagram style: hand-drawn` selects art by project default. An explicit
`--style clean` overrides that default; disabled art cannot be overridden by an
art style flag. Missing/disabled art preserves source and explains setup.
Neither condition affects an explicitly selected clean render.

## Visual briefs and optional HTML/PDF

Brief-only work requires no runtime setup. See the
[visual-brief skill](skills/visual-brief/SKILL.md) and its
[briefing method](skills/visual-brief/references/method.md),
[style guidance](skills/visual-brief/references/style.md) and
[PowerPoint handoff](skills/visual-brief/references/presentations.md).
Supplied templates and native editability requirements go to the existing host
workflow; Colloquium's experimental PPTX exporter is excluded.

For optional HTML/PDF, set `BRIEF_DIR` to the installed `skills/visual-brief`
directory, prepare a consumer workspace with `brief.md`, `slides.md`, optional
`DESIGN.md` and `assets/`, and choose a separate empty output directory:

```sh
uv sync --project "$BRIEF_DIR/scripts/colloquium" --frozen --no-dev
uv run --project "$BRIEF_DIR/scripts/colloquium" --frozen --no-dev python "$BRIEF_DIR/scripts/colloquium/adapter.py" --workspace "$DECK_WORKSPACE" --out "$DECK_BUNDLE" --format html
```

Use `--format pdf --capture` for PDF and page previews. Chromium is required
for PDF; Ghostscript enables native capture, while Poppler provides the fallback.
See [setup, asset packaging and limits](skills/visual-brief/references/colloquium.md).
No tools are installed automatically. Missing setup leaves copied sources and
reports the unfinished export; HTML does not count as PDF success.

The Python manifest/lock pins an evaluated Colloquium revision in its own
environment. It does not depend on pele, canvas, art fonts or PowerPoint extras.
Rendered SVG/PNG assets are the boundary. Keep local assets with HTML and heed
the report's CDN/network disclosures; offline single-file HTML is not promised.
Method and dependency licences are retained in [the notice](skills/visual-brief/NOTICE.md).

## Verification

From `skills/diagram/scripts`:

```sh
npm ci --ignore-scripts
npm test
npm run test:coverage
npm ci --prefix art --ignore-scripts
npm run test:art
```

`npm test` includes the mandatory clean-only release gate: copy the real plugin
without art or the Colloquium backend/environment, install only its core lockfile outside the checkout, clear shared
lookup settings and restrict PATH to Node. All six fixtures must retain labels,
sources and repeat bytes, including fresh CLI processes with no style flag.
Canvas/sharp cannot resolve; Python, uv and deck/browser tools are unavailable.
Optional art tests separately check graph counts, byte repeats, bare-source
layout, default clean behavior with art installed and disabled-policy rejection.
Set `VISUAL_SKILLS_KEEP_TEST_OUTPUT=1` to retain temporary outputs for visual QA.

The workflow in `.github/workflows/visual-skills.yml` runs diagram checks on
Linux/macOS Node 24 and a separate Python HTML/PDF job. From
`skills/visual-brief/scripts/colloquium`, run optional adapter tests with:

```sh
uv sync --frozen --group dev
uv run --frozen --group dev python -m pytest -q
VISUAL_SKILLS_PDF_SMOKE=1 uv run --frozen --group dev python -m pytest -q
```

The explicit PDF smoke needs Chromium and Poppler. Tests include real HTML/PDF,
source-only execution without site packages, missing-backend outcomes, asset
paths, warnings, capture routing and preservation. Native Ghostscript capture
is tested with stubs when Ghostscript is absent. Local Phase 3 checks use Node
24.22.1 and Python 3.14.9 on macOS arm64; the new Python CI job has not run yet.
Marketplace installation, real company templates and native presentation
applications require their own smoke checks.
