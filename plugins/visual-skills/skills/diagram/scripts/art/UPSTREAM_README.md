# The business of boba

Four statecharts about running a boba shop, drawn by hand in pen and coloured pencil, by code. Each chart is a small
TLA+ model that TLC checks, and each one is drawn a different way: order tickets on red thread, a shop front, two
cards side by side, and a bug traced in red.

See them at https://kevintngo.github.io/statechart-art/

| | plate | chart |
|---|---|---|
| I | An order, from the line to your hand | a flat chart with a branch and a loop |
| II | A day, at the shop, 7 am to 9 pm | a parent state |
| III | Two at once, the barista and the pot | two regions at the same time |
| IV | The pearl bug, TLC finds how old pearls get served | a rule that breaks, and the path to it |

Each plate is a square, sized to read on a phone. The images for x.com are in `docs/img/`.

## How they are made

1. **Model.** A TLA+ spec says what can happen in the shop, and its config lists the rules that must hold.
2. **Chart.** The /statechart skill checks the spec with TLC, the TLA+ model checker: it takes every step from every
   state the model can reach and checks each rule in each one. It writes the chart in Mermaid, in the words that
   `view.mjs` gives each state and step, and a report of the rules that hold and the rules that break.
3. **Lay out.** pele lays the chart out and measures every word in Kevin Serif Bold. `layout.mmd` is the chart with
   pele's spacing and direction added.
4. **Draw.** A script for each plate draws pele's layout in pen and coloured pencil on paper, with the shop around it.

## Make them again

The drawing needs Node (made with Node 24). Install it once:

```bash
cd tools && npm install
```

Draw a plate:

```bash
node business/art/order.js
```

The plate scripts are `order.js`, `day.js`, `counter.js` and `bug.js`. Each one writes `business/out/<plate>.png`
(2160 px), `<plate>-x.jpg` (2048 px, for x.com), `<plate>-preview.png` (1080 px), and `<plate>-pele.json`, pele's
boxes and lines where the plate puts them, which the site draws in blue over the plate. With `--fast`, it draws the same
files at half the size, for a quick look. The drawing is seeded, so the same code draws the same picture.

After the four plates, draw the icons and the share card:

```bash
node business/art/cards.js
```

Build the site into `docs/`, and look at it at http://localhost:5297:

```bash
node site/build.js
node site/serve.mjs
```

`SITE` sets the address in the share links, and `REPO` sets the link to the code:

```bash
SITE=https://example.com/boba/ REPO=https://github.com/you/boba node site/build.js
```

To check a model and write its chart again, run the /statechart skill. It writes only to a new or empty folder, so
give it a new one and compare that with `chart/`:

```bash
~/.claude/skills/statechart/scripts/statechart business/order/Order.tla --view business/order/view.mjs --out business/order/chart-new
```

The bug model exits with 1, because its rule breaks, as it should. When a chart changes, copy it into `layout.mmd`
and keep the `config` and `direction` lines.

## Files

| path | what it is |
|---|---|
| `business/<chart>/` | the model (`.tla` and `.cfg`), the view that words it (`view.mjs`), the chart /statechart wrote (`chart/`), and `layout.mmd` |
| `business/art/` | a script for each plate, the things in the shop (`shop.js`), and the icons and share card (`cards.js`) |
| `tools/lib/` | the plate in pen and coloured pencil, the letters, the people, and the chart drawer that turns pele's layout into tickets, signs and cards |
| `tools/kit/` | the dry media: paper, pencil, pen and crayon, laid down pixel by pixel |
| `tools/fonts/` | Kevin Serif and Kevin Sans |
| `site/` | the site's build, its style, and a local server |
| `docs/` | the built site, served by GitHub Pages |

## Credits

The models are checked by [TLC](https://github.com/tlaplus/tlaplus) (MIT). The charts are laid out by
[pele](https://pele.run) (MIT) and drawn with [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) (MIT). The
letters are Kevin Serif and Kevin Sans, A. V. Hershey's 1967 letters (public domain) written by a simulated pen.

## License

MIT, for everything here: the code, the models, the drawings and the fonts. See [LICENSE](LICENSE).
