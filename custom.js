/**
 * My Web Components (experimental)
 *
 * Only import the elements that you need!
 *
 * @see https://github.com/nfreear/web-components
 * @copyright © Nick Freear, 09-Jan-2022.
 * @license MIT
 */

import { getOptUse, hasElem } from './src/Options.js';
// Was: export { MyOptionsElement } from './src/components/MyOptionsElement.js';

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

if (hasElem('script[ src *= "/custom.js" ]')) {
  customImport().then(MOD => console.debug('Custom load:', MOD));
}
