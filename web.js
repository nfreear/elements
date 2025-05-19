/**
 * My Elements.
 * All exports - for direct inclusion in web pages.
 *
 * @see https://github.com/nfreear/elements
 * @copyright © Nick Freear, 04-Dec-2021.
 * @license MIT
 *
 * @status beta
 * @since 1.1.0
 * @file
 */

export * from './src/components/index.js';

export { MyElement } from './src/MyElement.js'; /** @legacy */
export { MyMinElement } from './src/MyMinElement.js';

export { defineMyElements, isClass } from './src/defineMyElements.js';
export { elemToClass, importJs, importMapOpt, whenReady } from './src/utilities.js';
export { getOpt, getOptUse } from './src/Options.js';
// export { importMapOpt } from './src/importMapOpt.js';
export { translate } from './src/translate.js';

// End.
