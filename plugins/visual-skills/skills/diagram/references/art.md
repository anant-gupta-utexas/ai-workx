# Optional hand-drawn state diagrams

Install only for a selected hand-drawn request. From the diagram skill directory:

```sh
npm ci --prefix scripts/art --ignore-scripts
node scripts/render.mjs --mmd /absolute/chart.mmd --out /absolute/chart.png --style hand-drawn --fast
```

Use absolute script paths when working from another directory. Art has its own
manifest and lockfile for pele and `@napi-rs/canvas`. Its code and four bundled
fonts can be omitted entirely without affecting clean rendering. There is no
automatic install, download or fallback to art.

Only basic flat `stateDiagram-v2` inputs are supported. Initial markers, named
states, labels and transitions are retained. Final markers, verification
classes (`breaks`, `mayBreak`, `bugPath`, `repeats`), composite/parallel states,
notes, classes and special state decorations are rejected. Use clean SVG when
those features are required, after explaining the art limitation.

The backend generates separate `-layout.mmd`, `-layout.svg`, `-shapes.json` and
`-render.json` files beside the PNG. It adds spacing defaults for sources with
no frontmatter and adds top-to-bottom direction when absent. Existing YAML is
kept verbatim, including its spacing settings; omitted settings within existing
frontmatter use pele defaults. No hand-edited layout file is required.

`--fast` produces a 1080px square preview; without it the output is 2160px.
`--title "..."` changes the plate heading; `--seed "..."` overrides the source
hash seed. The tested treatment is `ticket`, on hotpress paper; other treatments,
palettes and arbitrary page sizes are not exposed in this release.

Repeat bytes are tested within a pinned runtime. The report records renderer
revision, dependency versions, font, seed, Node, platform, architecture and file
hashes. Byte identity across runtimes or platforms is not promised.

The same `DESIGN.md` disable policy applies to `render.mjs` and the direct
`art/plate.mjs` entrypoint. Missing/disabled support keeps the source and returns
a setup/policy explanation; it does not change the requested format.
