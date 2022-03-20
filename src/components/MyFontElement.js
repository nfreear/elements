/**
 * Load a WOFF/2 font file using the "FontFace" interface (CSS3) - handle success and errors.
 *
 * @copyright © Nick Freear, 02-Mar-2022.
 *
 * @see https://gist.github.com/nfreear/3ad861197288cec0179716fe49c9567c
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FontFace
 * @see https://fontsource.org/fonts/aclonica
 */

import { MyElement } from '../MyElement.js';

const { FontFace } = window;

export class MyFontElement extends MyElement {
  static getTag () {
    return 'my-font';
  }

  async connectedCallback () {
    const name = this.getAttribute('family') || 'MyFont'; // Was: 'name'
    const url = this.getAttribute('url'); // https://example.com/MyFont.woff;
    const showSample = this.getAttribute('show-sample') === 'true'; // Was: 'show-example'
    const isIconFont = this.getAttribute('icon-font') === 'true';
    const addStyle = this.getAttribute('add-style') === 'true';
    const selector = this.getAttribute('selector') || '.my-font';

    console.assert(url, 'url');

    this.$$ = await this._loadFont(name, url);

    const TEMPLATES = await this.getTemplate('my-font');
    const STYLE_TPL = TEMPLATES[isIconFont ? 1 : 2];

    this._setupInnerStyle(name, showSample);

    if (addStyle) {
      this._addDocumentStyle(STYLE_TPL, name, selector);
    }

    /* if (showExample) { // && this.$$.ok
      const ELEM = this._showAlphabetPlus();
      this.attachShadow({ mode: 'open' }).appendChild(ELEM);
    } */

    console.debug('my-font:', TEMPLATES, this.$$, this);

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
      FONT.display = 'swap';
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

  /** @ DEPRECATED */
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

  /** @ DEPRECATED */
  _alphaGen (startChar = 'a', endChar = 'z', joiner = null) {
    const BET = [];
    for (let idx = startChar.charCodeAt(0); idx <= endChar.charCodeAt(0); idx++) {
      BET.push(String.fromCharCode(idx));
    }
    return joiner ? BET.join(joiner) : BET;
  }

  _setupInnerStyle (name, showSample = false) {
    const STYLE = this.shadowRoot.querySelector('style');
    const SAMPLE = this.shadowRoot.querySelector('.sample');
    const LABEL = this.shadowRoot.querySelector('h3');

    STYLE.textContent = STYLE.textContent.replace(/_FONT_FAMILY_/g, name);

    if (showSample) {
      LABEL.textContent = `Font: ${name}`;
      LABEL.hidden = false;
      SAMPLE.hidden = false;
    }
  }

  _addDocumentStyle (template, name, selector) {
    const STYLE_NODE = template.content.cloneNode(true);
    const STYLE = STYLE_NODE.querySelector('style');

    STYLE.textContent = STYLE.textContent.replace(/_FONT_FAMILY_/, name);
    STYLE.textContent = STYLE.textContent.replace(/_SELECTOR_/, selector);

    document.head.appendChild(STYLE_NODE);

    console.debug('Document - add style:', STYLE);
  }
}

MyFontElement.define();
