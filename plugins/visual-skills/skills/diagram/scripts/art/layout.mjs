import { parse } from 'pele';

export function prepareLayout(source) {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const body = normalized.replace(/^---\n[\s\S]*?\n---\n/, '');
  if (!/^\s*stateDiagram-v2\s*$/m.test(body))
    throw new Error('Unsupported art type: stateDiagram-v2 is required. Use clean SVG for other types.');
  if (/-->\s*\[\*\]/.test(body))
    throw new Error('Unsupported art feature: final-state markers. Use clean SVG to preserve them.');
  if (/\b(breaks|mayBreak|bugPath|repeats)\b/.test(body) && /(?:^\s*class\b|:::)/m.test(body))
    throw new Error('Unsupported art feature: verification marks require an explicit mapping.');
  if (/^\s*state\b.*\{/m.test(body) || /^\s*--\s*$/m.test(body))
    throw new Error('Composite and parallel states are unsupported by the art backend.');
  // Features that the upstream SVG reader would drop must fail before loading canvas/fonts.
  if (/^\s*(?:note|class|classDef|style|linkStyle|click|accTitle|accDescr)\b/m.test(body) || /<<|:::/.test(body))
    throw new Error('Unsupported art annotation or state decoration. Use clean SVG.');
  const model = parse(normalized, { limit: 1e6, maxEdges: 1e4 });
  if (model.type !== 'state' || model.graph.nodes.some(node => node.isGroup))
    throw new Error('Unsupported art structure; only flat state diagrams are supported.');
  let layout = normalized;
  // Preserve arbitrary existing YAML verbatim instead of attempting a partial YAML rewrite.
  // Existing frontmatter owns its spacing; pele defaults apply to omitted fields there.
  if (!layout.startsWith('---\n'))
    layout = '---\nconfig:\n  state:\n    rankSpacing: 26\n    nodeSpacing: 60\n---\n' + layout;
  if (!/^\s*direction\s+/m.test(body))
    layout = layout.replace(/^(\s*stateDiagram-v2\s*)$/m, '$1\n  direction TB');
  return { layout, model };
}
