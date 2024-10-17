/**
 * Dynamically import custom elements via a `my.js?use=my-elem,..` URL parameter.
 *
 * @example <script src="path/to/my.js?use=my-map,my-..." type="module"></script>
 * @license MIT
 */

import { elemToClass } from './src/Options.js';

const base = '.';
const url = new URL(import.meta.url);
const USE = url.search.match(/\?(use=)?(my-[a-z,-]+)/); // url.searchParams.get('use');
const ELEM = USE ? USE[2].split(',') : [];

const KLASS = ELEM.map((el) => {
  const klass = elemToClass(el);
  const path = `${base}/src/components/${klass}.js`;
  return { el, klass, path };
});

const PR = KLASS.map(async ({ path }) => await import(path));
await Promise.all(PR);

console.assert(KLASS.length, 'No custom elements imported.');
console.debug('My.js:', KLASS, url);
