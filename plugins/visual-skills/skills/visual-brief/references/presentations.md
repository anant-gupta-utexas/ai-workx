# Existing presentation workflow

Use the current host's supported presentation tools for PowerPoint and Google
Slides. In Codex, discover and read the installed Presentations skill, including
its runtime, template, authoring, validation and export instructions. Other
hosts need their own available route; this plugin installs none of them.
Do not copy a versioned host cache path into this plugin.

Pass the completed `brief.md`, slide outline, `DESIGN.md`, original assets and
the exact supplied template/reference to that workflow. Keep a short `handoff.md`
with requested format, slide count, template path, source-to-slide asset mapping,
factual sources, editability requirements and any unresolved assumptions.

When a real template is required, inspect it first. Preserve its dimensions,
fonts, repeated elements and requested content. If its file is absent, retain
the handoff and report the missing input; do not substitute a default theme and
claim template fidelity. A template ID or company design-system skill is not
assumed to exist.

Keep text/tables/charts editable as required by the host workflow. Clean SVG
and optional art PNG are image assets. If the user requests native diagram
shapes, reconstruct through the host API and verify labels, edges, boundaries
and markers against the canonical source. Do not claim that image insertion
automatically creates editable diagram objects.

Check SVGs after the host's final reimport, not only in a browser. In the local
PowerPoint smoke, imported SVG text metrics changed and labels overflowed even
with a correct aspect ratio. A PNG rendered from the same clean SVG preserved
the diagram in that workflow. When this occurs, use the host's available
rasterizer for the presentation asset, retain the canonical SVG/Mermaid and
inspect again. This downstream conversion adds no rasterizer to clean rendering.

Export, reimport/render and inspect the deliverable using that workflow's
checks. Retain factual sources in the relevant speaker notes. Native application
testing and supplied-template fidelity are separate claims; report only checks
actually performed.

Do not invoke Colloquium's experimental PPTX exporter, its `pptx` extra,
`python-pptx`, a native SVG converter or an HTML-to-PPTX path for this route.
Colloquium is optional HTML/PDF only. If no supported presentation backend is
available, sources and assets remain useful, but a requested deck export remains
unfinished; do not silently deliver HTML/PDF instead.
