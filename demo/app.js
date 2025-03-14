/**
 * Javascript specific to the TTS Demo.
 *
 * @copyright © Nick Freear, 27-Jan-2022.
 */

import * as MY from '../web.js';

// For "my-speech.html" ~ <my-text-to-speech>
const queryString = window.location.href;

const mtLang = queryString.match(/lang=(da|en|es|la|fr|zh)(-[\w]+)?/);
// const mtVox = queryString.match(/vox=([\w]+)/)
const LANG = mtLang ? mtLang[1] + (mtLang[2] || '') : 'en';

document.body.setAttribute('data-tts-lang', LANG);

console.debug('app.js (index.js):', MY);
