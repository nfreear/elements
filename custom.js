/**
 * My Elements (experimental).
 *
 * Dynamically import just the custom elements that you need!
 *
 * @see https://github.com/nfreear/elements
 * @copyright © Nick Freear, 09-Jan-2022.
 * @license MIT
 *
 * @status beta, my blog
 * @since 1.1.0
 * @file
 */

import { getOptUse, hasElem } from './src/Options.js';
// Was: export { MyOptionsElement } from './src/components/MyOptionsElement.js';

/**
 * Dynamically import just the custom elements that you need!
 * @param {string|array} use List or array of tag-names.
 * @example await customImport('my-analytics, my-feed');
 * @async
 */
export async function customImport (uses = null, base = '.') {
  if (hasElem('my-options')) {
    await import(`${base}/src/components/MyOptionsElement.js`);
  }

  const USED = getOptUse(uses).map(async ({ elem, klass }) => {
    const mod = await import(`${base}/src/components/${klass}.js`);

    return { elem, klass, mod };
  });

  return Promise.all(USED);
}

export default customImport;

if (hasElem('script[ src *= "/custom.js" ]')) {
  customImport().then(MOD => console.debug('Custom load:', MOD));
}
