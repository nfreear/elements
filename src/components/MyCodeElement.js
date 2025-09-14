/**
 * Display code with syntax highlighting.
 *
 * @copyright © Nick Freear, 22-Jan-2022.
 * @customElement my-code
 * @see https://craig.is/making/rainbows
 * @see https://github.com/ccampbell/rainbow/blob/master/src/language/html.js;
 * @see (https://prismjs.com/)
 * @status experiment
 */

import { rainbowViaCdn } from '../external-cdn.js';
import { MyElement } from '../MyElement.js';

export class MyCodeElement extends MyElement {
  static getTag () {
    return 'my-code';
  }

  /* constructor () {
    super();

    // window.Prism = window.Prism || {};
    // Prism.manual = true;

    console.debug('my-code:', this);
  } */

  async connectedCallback () {
    // _initialize();
    await this.getTemplate('my-code');

    const language = this.getAttribute('language') || 'html';

    const CODE = this.textContent.replace(/^\n/, '');

    const PRE = this.shadowRoot.querySelector('pre code');
    const LANG = this.shadowRoot.querySelector('summary small');

    LANG.textContent = language;

    /* PRE.textContent = CODE;

    /* setTimeout(() => {
      const RES = Prism.highlight(CODE, Prism.languages.markup, 'html');

      PRE.textContent = RES;
    },
    2000); */

    const Rainbow = await rainbowViaCdn();

    Rainbow.color(CODE, language, (hiCode) => {
      PRE.innerHTML = hiCode;

      console.debug('Rainbow:', language, CODE);
    });

    /* setTimeout(() => {
      const { Rainbow } = window;

      Rainbow.color(CODE, language, (hiCode) => {
        PRE.innerHTML = hiCode;

        console.debug('Rainbow:', language, CODE);
      });
    },
    1500); */

    console.debug('my-code:', 'connectedCallback.', this);
  }
}
