/**
 * Load a font using the "FontFace" interface (CSS3) - handle success and errors.
 *
 * @copyright © Nick Freear, 02-Mar-2022.
 *
 * @see https://gist.github.com/nfreear/3ad861197288cec0179716fe49c9567c
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FontFace
 * @see https://fontsource.org/fonts/aclonica
 * @see https://opendyslexic.org/
 */

import { MyElement } from '../MyElement.js';

const { FontFace } = window;

export class MyFontElement extends MyElement {
  static getTag () {
    return 'my-font';
  }

  async connectedCallback () {
    const name = this.getAttribute('name') || 'MyFont';
    const url = this.getAttribute('url'); // https://example.com/MyFont.woff;
    const showExample = this.getAttribute('show-example') === 'true';

    console.assert(url, 'url');

    this.$$ = await this._loadFont(name, url);

    if (showExample) { // && this.$$.ok
      const ELEM = this._showAlphabetPlus();
      this.attachShadow({ mode: 'open' }).appendChild(ELEM);
    }

    console.debug('my-font:', this.$$, this);

    // console.warn('Arial?', document.fonts.check('1em Arial'));
    // console.warn('Comic Sans MS?', document.fonts.check('1em "Comic Sans MS"'));
  }

  async _loadFont (name, url) {
    const HTML = document.querySelector('html');
    let FONT;
    let ok = false;
    let ex;
    try {
      FONT = new FontFace(name, `url(${url})`);
      // wait for font to be loaded
      await FONT.load();
      // add font to document
      document.fonts.add(FONT);
      // enable font with CSS class
      HTML.classList.add('my-font-loaded');
      HTML.setAttribute('my-font', name);

      ok = true;
    } catch (EX) {
      console.error('Font Loading Error:', EX, FONT);
      ex = EX;

      HTML.classList.add('my-font-error');
    }

    return { name, url, font: FONT, ok, ex };
  }

  _showAlphabetPlus () {
    const JOIN = ' ';
    const SYM = '{ } [ ] ( ) < > ! + ? & % → ©';

    const LOWER = this._alphaGen('a', 'z', JOIN);
    const UPPER = this._alphaGen('A', 'Z', JOIN);
    const NUM = this._alphaGen('0', '9', JOIN);

    const ELEM = document.createElement('p');

    ELEM.textContent = `${LOWER} ${UPPER} ${NUM} ${SYM}`;

    return ELEM;
  }

  _alphaGen (startChar = 'a', endChar = 'z', joiner = null) {
    const BET = [];
    for (let idx = startChar.charCodeAt(0); idx <= endChar.charCodeAt(0); idx++) {
      BET.push(String.fromCharCode(idx));
    }
    return joiner ? BET.join(joiner) : BET;
  }
}

MyFontElement.define();
