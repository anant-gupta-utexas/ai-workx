# Project style

Adapted from ui-skills' evidence-based style and review methods; see
[NOTICE.md](../NOTICE.md). This plugin uses ordinary Markdown guidance and the
diagram policy lines, not a design-token exporter or a required company system.

Read existing `DESIGN.md`, supplied templates/reference files, brand assets and
the project's active theme before choosing typography, palette or diagram style.
Retain accepted choices unless the user changes them. Distinguish observed
style, explicit user choices and proposed defaults; a recurring implementation
detail alone does not establish a brand rule.

Create or update `DESIGN.md` only when it will guide this deliverable or later
work. Record the relevant typography, palette, spacing/density, diagram direction,
source of style decisions and supplied reference/template path. Keep it concise;
do not invent token names, company rules or unsupported rationale.

Use the exact plain-text policy lines understood by `diagram`:

```text
Default diagram style: clean
Hand-drawn support: enabled
```

`enabled` permits optional art; it does not install it or select it by default.
Use `disabled` when the project forbids art. `Default diagram style: hand-drawn`
selects it by project choice only where supported. Disabled support takes
precedence. An explicit clean request overrides a project art default.

The diagram CLI searches upward from each `.mmd` source for the nearest
`DESIGN.md`; keep sources within that project or pass the intended file through
`--design`. Keep one policy definition per file. Do not silently change a
disabled policy or remove diagram semantics to obtain an art render.

For review, compare the intended style and content with rendered evidence,
make a specific correction and inspect again. Stop when the requested output
meets its contract; do not add unrelated styling or a new review service.
Template fidelity needs a supplied reference and a visual comparison. A file
path or successful export alone does not establish it.
