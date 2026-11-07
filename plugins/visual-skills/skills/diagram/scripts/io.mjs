import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const sha256 = value => createHash('sha256').update(value).digest('hex');

export function protectSource(input, outputs) {
  const source = fs.statSync(input);
  for (const output of outputs) {
    if (path.resolve(output) === path.resolve(input)) throw new Error('Output must not overwrite the source.');
    if (fs.existsSync(output)) {
      const target = fs.statSync(output);
      if (target.dev === source.dev && target.ino === source.ino)
        throw new Error('Output aliases the source; refusing to overwrite it.');
    }
  }
}

export function writeOutput(file, content) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, content);
}
