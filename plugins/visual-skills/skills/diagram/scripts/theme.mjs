// Materialize pele's CSS variables so SVG consumers need no CSS-variable support.
// This resolves the pinned renderer's declarations, not arbitrary stylesheets.
export const cleanTheme = Object.freeze({
  '--pele-bg': '#ffffff', '--pele-fg': '#172d3a', '--pele-muted': '#47616b',
  '--pele-line': '#365b6d', '--pele-surface': '#edf4f5', '--pele-surface-alt': '#deeaed',
  '--pele-border': '#73919b', '--pele-font': 'Arial', '--pele-radius': '4px',
});

export function portableSvg(svg) {
  const styles = [...svg.matchAll(/\bstyle="([^"]*)"/g)].map(match => match[1]).join(';');
  const variables = { ...Object.fromEntries(
    [...styles.matchAll(/(--[\w-]+):([^;"<>]+)/g)].map(match => [match[1], match[2]])), ...cleanTheme };
  function resolve(value, stack = []) {
    let start;
    while ((start = value.indexOf('var(')) !== -1) {
      let end = start + 4, depth = 1;
      for (; end < value.length && depth; end++) {
        if (value[end] === '(') depth++;
        if (value[end] === ')') depth--;
      }
      if (depth) throw new Error('Unclosed CSS variable');
      const inside = value.slice(start + 4, end - 1);
      let comma = -1, nesting = 0;
      for (let i = 0; i < inside.length; i++) {
        if (inside[i] === '(') nesting++;
        if (inside[i] === ')') nesting--;
        if (inside[i] === ',' && nesting === 0) { comma = i; break; }
      }
      const name = (comma < 0 ? inside : inside.slice(0, comma)).trim();
      if (stack.includes(name)) throw new Error(`CSS variable cycle: ${name}`);
      const replacement = variables[name] ?? (comma < 0 ? undefined : inside.slice(comma + 1));
      if (replacement === undefined) throw new Error(`Unresolved CSS variable: ${name}`);
      value = value.slice(0, start) + resolve(replacement, [...stack, name]) + value.slice(end);
    }
    return value;
  }
  // Restrict substitution to presentation attributes; visible labels may literally say var(...).
  return svg.replace(/\b(style|fill(?:-opacity)?|stroke(?:-width|-opacity|-dasharray)?|color|opacity|font(?:-family|-size|-weight|-style)?|stop-color|flood-color)="([^"]*)"/g,
    (_, name, value) => `${name}="${resolve(value)}"`);
}
