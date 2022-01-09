/**
 * Only import the Web Components that you need!
 *
 * @copyright © Nick Freear, 09-Jan-2022.
 * @license MIT
 */

import { getOptUse } from './src/Options.js';
export { MyOptionsElement } from './src/components/MyOptionsElement.js';

export async function customImport (uses = null, base = '.') {
  const USE = getOptUse(uses).map(async ({ elem, klass }) => {
    const result = await import(`${base}/src/components/${klass}.js`);

    return { elem, klass, result };
  });

  Promise.all(USE).then(data => console.debug('Custom:', data));
}

if (document.querySelector('script[ src *= "custom.js" ]')) {
  customImport();
}
