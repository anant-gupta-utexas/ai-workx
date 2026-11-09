---
name: visual-brief
description: Turn a short presentation or visual-document request into an evidence-backed brief, style guidance, slide outline and diagram assets. Use for deck planning, visual storytelling, presentation handoffs, or optional Colloquium HTML/PDF output. PowerPoint and Google Slides use the host's existing presentation workflow. Use diagram directly for a standalone diagram.
---

# Visual brief

Produce a useful brief and editable sources before depending on an export tool.
Resolve paths from this skill's installed directory; the working directory
belongs to the consumer project.

## Brief and style

Read [references/method.md](references/method.md) for the brief and edit method.
Use the conversation, supplied materials and repository evidence for audience,
message, beats, sources and required output. Ask only for information that
materially changes the result and cannot be inferred; label other assumptions.

Read [references/style.md](references/style.md) before creating or updating
`DESIGN.md`. Preserve accepted style choices and supplied assets. Default to
clean diagrams. Hand-drawn assets require an explicit request or project choice
and enabled support; honor the diagram skill's disabled-art policy.

Create a consumer workspace with `brief.md` and, when making slides, `slides.md`.
Keep images, `.mmd` sources, stylesheets and bibliography files under `assets/`.
Record factual sources and assumptions in the brief and relevant speaker notes.
Write sources directly for brief-only requests; no runtime setup is required.
Use the sibling `diagram` skill for requested diagrams, preserving its `.mmd`.

## Select the requested output

| Requested output | Route |
| --- | --- |
| Brief/outline only | Return sources; install no backend |
| HTML or Colloquium PDF | Read [references/colloquium.md](references/colloquium.md); use the optional adapter |
| PowerPoint or Google Slides | Read [references/presentations.md](references/presentations.md); invoke the available host workflow |

Do not route PowerPoint through Colloquium, convert its HTML to PPTX, or install
its experimental PowerPoint extras. Supplied templates belong to the selected
workflow. If a template or backend is missing, keep the brief, outline and
assets, state what export is unfinished and explain the required setup. Do not
claim template fidelity or silently change the requested format.

## Review and hand off

Inspect every final slide/page, including diagrams, labels, citations and local
assets. Follow the selected presentation workflow's validation instructions.
For Colloquium PDF, capture page previews and inspect each; for HTML, check it
in an available browser as well. A successful export is not visual review.

Keep claims, assumptions and image editability accurate. SVG/PNG assets remain
images unless a presentation tool reconstructs and verifies native objects.
Return the requested deliverable and its editable sources, noting any network
requirements or incomplete work that affects use. Never describe a bundle with
relative assets or CDN URLs as a verified offline single file.
