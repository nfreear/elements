/**
 * Javascript specific to the TTS Demo.
 *
 * @copyright © Nick Freear, 27-Jan-2022.
 */

import '../index.js';

// For "my-speech.html" ~ <my-text-to-speech>
const queryString = window.location.href;

const mtLang = queryString.match(/lang=(en|es|fr|zh)(-[\w]+)?/);
// const mtVox = queryString.match(/vox=([\w]+)/)
const LANG = mtLang ? mtLang[1] + (mtLang[2] || '') : 'en';

document.body.setAttribute('data-tts-lang', LANG);
