---
name: diagram
description: Create or edit Mermaid diagrams and render portable SVG, with optional hand-drawn PNG for flat state diagrams. Use for architecture diagrams, flowcharts, sequence diagrams, ER diagrams, state diagrams, or rendering an existing .mmd file. Does not model-check statecharts or create presentations.
---

# Diagram

Keep `.mmd` as the editable source and write rendered assets separately.
Preserve supplied labels, transitions, boundaries, cardinality and start/end
markers. Rendering does not establish that a system is correct or verified.

## Choose the output

- Default to clean SVG. Read the nearest `DESIGN.md` above the source for
  project style; an explicit clean request overrides a project art default.
- Use hand-drawn output only for an explicit request or project style setting,
  with support enabled. Read [references/art.md](references/art.md) only then.
- For source only, write or update the Mermaid without installing dependencies.

When authoring Mermaid, read [references/mermaid-rules.md](references/mermaid-rules.md).
Use the supported type that expresses the requested relationships. Do not
simplify away unsupported semantics to force an art render.

## Render

Resolve this skill's directory from the loaded `SKILL.md` location; use absolute
script paths because the working directory belongs to the user's project.
Node 24 or later is required. Install the core once with
`npm ci --prefix <skill-dir>/scripts --ignore-scripts`. This installs pele only.

```sh
node <skill-dir>/scripts/render.mjs --mmd /absolute/chart.mmd --out /absolute/chart.svg
```

The renderer finds `DESIGN.md` from the input directory upward; use
`--design /absolute/DESIGN.md` to select a specific file. These plain-text
settings control style:

```text
Default diagram style: clean
Hand-drawn support: disabled
```

Use `enabled` to permit optional art while keeping ordinary diagrams clean.
A disabled policy takes precedence over an explicit hand-drawn request.
For clean rendering regardless of project default, pass `--style clean`.

If setup is unavailable or a requested backend fails, retain the source and
explain the setup or unsupported feature. Do not silently switch the requested
style or install optional dependencies for a clean request.

## Inspect and hand off

Inspect the rendered image with the host's available preview tool. Check labels,
arrow direction, boundaries, start/end markers and legibility. An SVG file
existing is not visual verification. If preview is unavailable, say so.

Return source and output paths with the selected style and any remaining limit.
SVG/PNG assets are images; do not promise individually editable presentation
shapes. For presentation output, use the host's available presentation workflow.
