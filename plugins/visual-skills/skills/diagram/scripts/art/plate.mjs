import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { prepareLayout } from './layout.mjs';
import { readPolicy, selectStyle } from '../policy.mjs';
import { protectSource, sha256, writeOutput } from '../io.mjs';

async function main() {
  const { values: options } = parseArgs({ options: {
    mmd: { type: 'string' }, out: { type: 'string' }, design: { type: 'string' },
    fast: { type: 'boolean' }, title: { type: 'string' }, seed: { type: 'string' },
  } });
  if (!options.mmd || !options.out) throw new Error('node art/plate.mjs --mmd chart.mmd --out chart.png [--fast] [--title text] [--seed text]');
  selectStyle('hand-drawn', readPolicy(options.mmd, options.design));
  if (path.extname(options.out) !== '.png') throw new Error('Hand-drawn output must use .png');
  const stem = options.out.slice(0, -4);
  const files = { layout: stem + '-layout.mmd', svg: stem + '-layout.svg',
    shapes: stem + '-shapes.json', report: stem + '-render.json' };
  protectSource(options.mmd, [options.out, ...Object.values(files)]);
  const source = fs.readFileSync(options.mmd, 'utf8');
  const sourceSha256 = sha256(source);
  const { layout, model } = prepareLayout(source);
  const require = createRequire(import.meta.url);
  const { layOut, mapper, contentBox, saveShapes } = require('./lib/layout.js');
  const { plate } = require('./lib/storybook.js');
  const { draw } = require('./lib/tagchart.js');
  writeOutput(files.layout, layout);
  const graph = await layOut(files.layout, { svgOut: files.svg });
  // The pinned parser represents pseudo-states by shape; compare named nodes by ID.
  const ids = new Set(graph.nodes.map(node => node.id));
  const expected = model.graph.nodes.filter(node => node.shape !== 'stateStart');
  const expectedStarts = model.graph.nodes.filter(node => node.shape === 'stateStart').length;
  if (!graph.nodes.length || graph.nodes.length !== expected.length || expected.some(node => !ids.has(node.id)) ||
      graph.edges.length !== model.graph.edges.length || graph.starts.length !== expectedStarts)
    throw new Error('Art layout dropped graph content. Source preserved; use clean SVG.');
  if (graph.clusters.length || graph.dividers.length)
    throw new Error('Composite and parallel states cannot be drawn by this backend.');
  const seed = options.seed ?? sourceSha256;
  const page = plate({ id: 'diagram', w: 216, h: 216, ppm: options.fast ? 5 : 10,
    seed, paper: 'hotpress' });
  const map = mapper(contentBox(graph), { x: 8, y: 24, w: 200, h: 184 });
  page.text(options.title ?? 'State diagram', 10, 15, { size: 8 });
  draw(page, graph, map, { style: 'ticket', labelsBeside: true, stopShort: 3.4,
    bounds: { x0: 4, x1: 212 }, lineColor: '#a8443b', startColor: '#a8443b', pinColor: () => '#3f7fae' });
  saveShapes(files.shapes, graph, map);
  await page.finish(options.out);
  if (sha256(fs.readFileSync(options.mmd)) !== sourceSha256) throw new Error('Source changed during rendering.');
  const report = { renderer: 'statechart-art', revision: '09c959c79e25767cc34a5beddf3df234b085636e',
    pele: '1.9.0', canvas: '1.0.13', style: 'hand-drawn', treatment: 'ticket',
    font: 'Kevin Serif / Kevin Sans', node: process.version, platform: process.platform,
    arch: process.arch, seed, fast: options.fast ?? false, out: path.resolve(options.out),
    nodes: graph.nodes.length, edges: graph.edges.length, starts: graph.starts.length,
    sourceSha256, outputSha256: sha256(fs.readFileSync(options.out)) };
  writeOutput(files.report, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}

try { await main(); }
catch (error) {
  const setup = error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND';
  console.error(setup ? 'Optional art dependencies are missing. Source preserved. Run npm ci --prefix art from the diagram scripts directory.' : error.message);
  process.exitCode = 1;
}
