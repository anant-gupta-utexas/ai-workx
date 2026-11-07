# Third-party provenance

The clean renderer depends on [pele](https://github.com/kevintngo/pele), MIT,
version 1.9.0, pinned with integrity in `scripts/package-lock.json`. No pele
source is vendored; npm installs its licence with the dependency.

The optional art bundle is copied from
[kevintngo/statechart-art](https://github.com/kevintngo/statechart-art) at
revision `09c959c79e25767cc34a5beddf3df234b085636e`, copyright 2026 Kevin T. Ngo.
The upstream MIT licence is retained at `scripts/art/LICENSE`; its README,
including font provenance and the explicit licence coverage, is retained at
`scripts/art/UPSTREAM_README.md` as attribution, not plugin setup instructions.

Unmodified upstream files are the seven modules under `scripts/art/lib/`,
seven modules under `scripts/art/kit/` and four TTFs under `scripts/art/fonts/`.
These are the traced dependency closure for the plate renderer. Kevin Serif and
Kevin Sans derive from A. V. Hershey's 1967 public-domain letters; upstream
states that its MIT licence covers the fonts as well as code and drawings.
Consumer platforms may use their own fallback fonts for clean SVG.

The adapter modules (`render.mjs`, `theme.mjs`, `policy.mjs`, `io.mjs`,
`art/plate.mjs`, `art/layout.mjs`) and tests are maintained by AI WorkX under
this repository's MIT licence. They add source preservation, policy enforcement,
generic layout preparation, semantic rejection and portable SVG export.

Optional `@napi-rs/canvas` 1.0.13 and pele 1.9.0 are pinned separately in
`scripts/art/package-lock.json`. Canvas is MIT-licensed and includes native
platform packages with their own notices. Dependency installation retains those
notices; the clean package does not depend on these native packages.
