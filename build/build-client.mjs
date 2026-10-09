/**
 * Assemble the browser bundle from the authored sources.
 *
 * Shipped client bundles are lazy-CJS scripts: the Host serves `lib/client.js`
 * verbatim, the page runs it, and it registers exactly one factory in
 * `window.__ModuleLoader__`. The registered id must equal the manifest package
 * name, because that id is the boot-graph row the module system waits for.
 *
 * The authored sources are plain scripts (no imports) so that the bundle keeps
 * exactly one external: `react`, a platform seed word.
 *
 * usage: node build/build-client.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

/** Refuse to build a bundle whose id would not match the manifest name. */
const id = pkg.name;

const palette = readFileSync(join(root, 'src', 'palette.js'), 'utf8');
const client = readFileSync(join(root, 'src', 'client.js'), 'utf8');

for (const [file, text] of [['src/palette.js', palette], ['src/client.js', client]]) {
  if (/^\s*(?:import|export)\s/m.test(text)) {
    throw new Error(`${file}: sources must stay import-free (the bundle has one external: react)`);
  }
  if (text.includes('//#region') || text.includes('sourceMappingURL')) {
    throw new Error(`${file}: unexpected bundler marker`);
  }
}
if (!/^function apply\(/m.test(client)) throw new Error('src/client.js must declare apply()');
if (!/^const inject = /m.test(client)) throw new Error('src/client.js must declare the inject list');

/** One tab of indentation, matching the shipped bundles' nesting. */
const indent = (text) =>
  text
    .replace(/\s+$/, '')
    .split('\n')
    .map((line) => (line.length === 0 ? line : `\t\t${line}`))
    .join('\n');

const out = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(id)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
\t\tlet react = require("react");
${indent(palette)}

${indent(client)}
\t\texports.apply = apply;
\t\texports.inject = inject;
\t\texports.AMOLED_THEMES = AMOLED_THEMES;
\t\texports.AMOLED_ACCENTS = AMOLED_ACCENTS;
\t\texports.AMOLED_DEFAULT_ACCENT = AMOLED_DEFAULT_ACCENT;
\t\treturn module.exports;
\t}
});
`;

const dest = join(root, 'lib', 'client.js');
writeFileSync(dest, out);
const tokenCount = (palette.match(/^\s*"--/gm) ?? []).length;
console.log(`wrote ${dest} (${out.length} bytes, id ${id}, ${tokenCount} token declarations)`);
