# Visual Skills

Mermaid sources and portable diagrams, with clean SVG by default and optional
hand-drawn state diagrams. Version 0.1.0 ships one skill: `diagram`.
It installs independently of essentials; neither plugin requires the other.
The repo's root `plugin.json` is also exposed through
`.claude-plugin/plugin.json` as a relative symlink for Claude Code discovery.

```text
/plugin install visual-skills@ai-workx
```

Ask for a flowchart, sequence, ER or state diagram, or provide a `.mmd` file.
The skill keeps the source and renders a separate asset. It does not bundle a
state model checker, PowerPoint engine, Figma integration or HTML/PDF deck
backend. Briefs and presentation adapters are future work.

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
without art, install only its core lockfile outside the checkout, clear shared
lookup settings and restrict PATH to Node. All six fixtures must retain labels,
sources and repeat bytes, including fresh CLI processes with no style flag.
Canvas/sharp cannot resolve; Python, uv and deck/browser tools are unavailable.
Optional art tests separately check graph counts, byte repeats, bare-source
layout, default clean behavior with art installed and disabled-policy rejection.
Set `VISUAL_SKILLS_KEEP_TEST_OUTPUT=1` to retain temporary outputs for visual QA.

The workflow in `.github/workflows/visual-skills.yml` runs these checks on Linux
and macOS with Node 24. Local verification used Node 24.22.1 on macOS arm64;
the CI matrix has not yet run. Claude Code's local `--plugin-dir` inventory
discovers exactly one skill. Marketplace installation into a host session and
native presentation applications require their own smoke checks.
