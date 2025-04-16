/**
 * Dynamically import custom elements via an 'importmap'.
 *
 * @example <script type="importmap">{ "imports": {}, "myElements": { "use": [ "my-map" ] } }</script>
 * @license MIT
 */

import importMapOpt from './src/importMapOpt.js';
import { elemToClass } from './src/Options.js';

const { customElements } = window;
const base = '.';

try {
  const ELEM = importMapOpt('myElements', 'use');
  console.assert(Array.isArray(ELEM), 'myElements.use - Should be an array.');

  const KLASS = ELEM.map((el) => {
    const klass = elemToClass(el);
    const path = `${base}/src/components/${klass}.js`;
    return { el, klass, path };
  });

  const PR = KLASS.map(async ({ klass, path }) => {
    const MOD = await import(path);
    // console.debug('class:', MOD[klass]); // HTMLElement.prototype.isPrototypeOf(MOD[klass]));
    console.assert(typeof MOD[klass] === 'function', `Should be an exported class: ${klass}`);
    console.assert(MOD[klass].getTag, '"getTag()" - Static function not found.');
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

// End.
