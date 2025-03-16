/**
 * Dynamically import custom elements via an import map.
 *
 * @example <script type="importmap">{ "imports": {}, "myElements": { "use": [ "my-map" ] } }</script>
 * @license MIT
 */

import { elemToClass } from './src/Options.js';

const { customElements } = window;
const base = '.';

try {
  const importMapElement = document.querySelector('script[ type = importmap ]');
  const importMap = importMapElement ? JSON.parse(importMapElement.textContent) : null;
  const myElements = importMap ? importMap.myElements : null;
  const ELEM = myElements ? myElements.use : [];

  const KLASS = ELEM.map((el) => {
    const klass = elemToClass(el);
    const path = `${base}/src/components/${klass}.js`;
    return { el, klass, path };
  });

  const PR = KLASS.map(async ({ klass, path }) => {
    const MOD = await import(path);
    customElements.define(MOD[klass].getTag(), MOD[klass]);
  });
  await Promise.all(PR);

  console.assert(KLASS.length, 'No custom elements imported.');
  console.debug('i.js:', KLASS);
} catch (err) {
  const M = err.stack.match(/(failed to fetch|error loading) dyn.*\/(\w+)\.js/i);
  if (M) {
    console.error('404 Error:', M[2], '~', err);
  } else {
    console.error('ERROR:', err);
  }
}

/*
const importMapElement = document.querySelector('script[ type = importmap ]');
console.assert(importMapElement, 'Expecting an importmap `<script>` element. None found.');
const importMap = importMapElement ? JSON.parse(importMapElement.textContent) : null;
console.assert(importMap, 'Expecting an importmap JSON object.');
const { myElements } = importMap;
console.assert(myElements, 'Expecting a `myElements` object on importmap');
console.assert(myElements && myElements.use && myElements.use.constructor.name === 'Array', 'Expecting a `myElements.use` array.');
const ELEM = myElements ? myElements.use : [];

const KLASS = ELEM.map((el) => {
  const klass = elemToClass(el);
  const path = `${base}/src/components/${klass}.js`;
  return { el, klass, path };
});

const PR = KLASS.map(async ({ path }) => await import(path));
await Promise.all(PR);

console.debug('i.js:', KLASS, import.meta.url);
*/
