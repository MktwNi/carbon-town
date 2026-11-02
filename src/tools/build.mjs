#!/usr/bin/env node
/*
 * GHG Town 3D — rebuild the generated site files from src/.
 *
 *   src/engine/*.js      -> js/ghg3-engine.min.js   (concatenated in ENGINE_ORDER, minified with terser)
 *   src/ui/Main.dc.html  -> js/app.js               (template + logic, mounted in the page by js/dc-lite.js)
 *   src/ui/dc-lite.js    -> js/dc-lite.js           (copied)
 *
 * js/content.js, js/three.min.js, assets/ and index.html are not generated: edit them directly.
 * Usage:  npm install   (once, installs terser)   then   npm run build
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const p = (...a) => join(ROOT, ...a);
const VERSION = JSON.parse(readFileSync(p('package.json'), 'utf8')).version.replace(/\.0$/, '');

// ------------------------------------------------------------------ engine
// order matters: later modules may override earlier ones (mascots replaces the guide from actors)
const ENGINE_ORDER = ['core', 'layout', 'sky', 'terrain', 'actors', 'mascots', 'complexes', 'rural', 'world', 'play', 'film', 'audio', 'tune'];
const MIXIN = `/* ---- mixin ---- */
(function () {
  class GHGTownMixin {}
  const seen = {};
  const OVERRIDE = { _initGuide: 'mascots', _tickGuide: 'mascots' };
  for (const mod of ['core', 'sky', 'terrain', 'actors', 'mascots', 'complexes', 'rural', 'world', 'play', 'film', 'audio', 'tune']) {
    const M = window.GHG3[mod];
    if (!M) continue;
    for (const k of Object.keys(M)) {
      if (seen[k] && OVERRIDE[k] !== mod && window.console) console.warn('[GHG Town] duplicate method', k, seen[k], mod);
      seen[k] = mod;
      GHGTownMixin.prototype[k] = M[k];
    }
  }
  window.GHGTownMixin = GHGTownMixin;
})();
`;

async function buildEngine() {
  let out = `/* GHG Town 3D v${VERSION} engine — ${ENGINE_ORDER.join(', ')} (three.js r149) */\n`;
  for (const m of ENGINE_ORDER) out += `/* ---- ${m}.js ---- */\n` + readFileSync(p('src', 'engine', m + '.js'), 'utf8') + '\n';
  out += MIXIN;
  mkdirSync(p('build'), { recursive: true });
  writeFileSync(p('build', 'ghg3-engine.js'), out); // readable copy for debugging (not deployed, git-ignored)
  let terser;
  try { terser = await import('terser'); } catch (e) {
    console.error('terser is not installed — run "npm install" first.');
    process.exit(1);
  }
  const min = await terser.minify(out, { compress: { passes: 1 }, mangle: true, format: { comments: false } });
  if (!min.code) throw new Error('terser produced no output');
  writeFileSync(p('js', 'ghg3-engine.min.js'), min.code);
  console.log('js/ghg3-engine.min.js', min.code.length, 'bytes (from', out.length, ')');
}

// ------------------------------------------------------------------ app (UI)
// In the Claude Design version the mascot sprite sheets are uploaded assets (/_blob/<id>); here they live in assets/.
const SHEETS = {
  b8b288cc06a64a038ad25b06a604a8be: 'assets/owl.webp',
  '8274b431ac163e0c43c70920779cb224': 'assets/sapling.webp',
  '5baf69e2e2c6a53cd01a81a591164af2': 'assets/firefly.webp'
};
function buildApp() {
  const html = readFileSync(p('src', 'ui', 'Main.dc.html'), 'utf8');
  const sm = html.match(/<script type="text\/x-dc" data-dc-script data-props='([^']*)'>([\s\S]*?)<\/script>/);
  const tm = html.match(/<x-dc>([\s\S]*)<\/x-dc>/);
  if (!sm || !tm) throw new Error('src/ui/Main.dc.html: <x-dc> template or data-dc-script not found');
  let script = sm[2], tpl = tm[1];
  for (const [id, path] of Object.entries(SHEETS)) {
    script = script.split('/_blob/' + id).join(path);
    tpl = tpl.split('/_blob/' + id).join(path);
  }
  if (script.includes('/_blob/') || tpl.includes('/_blob/')) throw new Error('unmapped /_blob/ url in src/ui/Main.dc.html — add it to SHEETS');
  const app = [
    `/* GHG Town 3D (เมืองคาร์บอน) v${VERSION} — app: template + logic (generated from src/ui/Main.dc.html by src/tools/build.mjs; do not edit) */`,
    'window.__DC_TPL = ' + JSON.stringify(tpl) + ';',
    script.trim(),
    'window.GHGApp = window.DCLite.mount(document.getElementById("app"), window.__DC_TPL, Component);',
    ''
  ].join('\n');
  writeFileSync(p('js', 'app.js'), app);
  copyFileSync(p('src', 'ui', 'dc-lite.js'), p('js', 'dc-lite.js'));
  console.log('js/app.js', app.length, 'chars · js/dc-lite.js copied');
}

buildApp();
await buildEngine();
console.log('done — open index.html (or "npm run serve") to check, then commit.');
