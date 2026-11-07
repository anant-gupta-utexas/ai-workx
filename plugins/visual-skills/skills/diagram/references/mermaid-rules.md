# Mermaid rendering rules

The pinned pele 1.9.0 release is tested here on flowcharts (including a subgraph),
four-participant sequences, ER diagrams with cardinality and flat state diagrams
with initial and final markers. Other syntax is not part of this release's
compatibility promise; try clean rendering and inspect it before claiming support.

- Use flowcharts for steps and branches, sequence diagrams for actor interactions,
  ER diagrams for entities and relationships, and `stateDiagram-v2` for states.
- Keep IDs stable and use readable labels. Preserve the input rather than
  converting unfamiliar syntax into a different meaning.
- Preserve relationship cardinality, transition labels, guards and retry paths.
  Do not introduce `[ * ]` with spaces; Mermaid markers are `[*]`.
- A state chart illustrates supplied behavior. No checker is bundled; keep
  verification claims and counterexample markings tied to actual checker evidence.

Clean SVG uses a neutral palette and Arial with literal CSS values so image
consumers need no CSS-variable support. It needs no browser, fonts, canvas,
rasterizer, Python or presentation backend. Font appearance depends on the
consumer's installed Arial/substitute. Unicode and other diagram types need
their own visual check.

The CLI preserves input files and refuses output paths that alias the source.
It creates output directories and replaces existing output assets. To make a
separate source copy without rendering:

```sh
node <skill-dir>/scripts/render.mjs --mmd chart.mmd --out copy.mmd --source-only
```
