/**
 * Slide-decks / presentations - Powered by Reveal.js.
 *
 * @see https://revealjs.com
 * @copyright © Nick Freear, 24-Sep-2022.
 */

import { MyElement } from '../MyElement.js';

// const REVEAL_MJS = 'https://cdn.skypack.dev/impress.js';
const REVEAL_MJS = 'https://unpkg.com/reveal.js@4.3.1/dist/reveal.esm.js';
const MARKDOWN_MJS = 'https://unpkg.com/reveal.js@4.3.1/plugin/markdown/markdown.esm.js';
const THEME_URL = 'https://unpkg.com/reveal.js@4.3.1/dist/theme/%{theme}.css';

const TEMPLATE = `
<link rel="stylesheet" href="https://unpkg.com/reveal.js@4.3.1/dist/reveal.css">
<link rel="X-stylesheet" href="https://unpkg.com/reveal.js@4.3.1/dist/theme/simple.css">
<style>
  .X.reveal { display: block; height: 100%; }
  .X.slides { transform: translate(-50%, 0) scale(0.8) !important; }
</style>

<!-- <div class="reveal"> -->
  <div class="slides">
    <slot>
      <section data-markdown>
        # Slide 11
        * Bullet A.
        * Bullet B.
      </section>
    </slot>
  </div>
<!-- </div> -->
`;

export class MySlideDeckElement extends MyElement {
  static getTag () {
    return 'my-slide-deck';
  }

  async connectedCallback () {
    const { default: Reveal } = await import(REVEAL_MJS);
    const { default: Markdown } = await import(MARKDOWN_MJS);

    const theme = this.getAttribute('theme') || 'simple';

    const ROOT_ELEM = this._templateFromString(TEMPLATE);
    this._addThemeStylesheet(theme);

    this.classList.add('reveal');
    // this.style.display = 'block';
    // this.style.height = '100%';

    console.log('Reveal.js:', Reveal);

    const deck = new Reveal(ROOT_ELEM, {
      // https://revealjs.com/config/
      controls: true,
      controlsTutorial: true,
      progress: true,
      slideNumber: true,
      hashOneBasedIndex: true,

      plugins: [Markdown]
    });

    const EV = await deck.initialize();

    console.debug('my-slides: Impress ready:', deck, EV, this.dataset, this);
  }

  _templateFromString (templateHtml, rootSelector = '.reveal', slotSelector = '.slides') {
    const CONTENT = this.innerHTML;

    /* const ELEM = document.createElement('div');
    ELEM.innerHTML = templateHtml;

    this.attachShadow({ mode: 'open' }).appendChild(ELEM);

    const SLOT_ELEM = this.shadowRoot.querySelector(slotSelector);

    SLOT_ELEM.innerHTML = CONTENT; // SLOT_ELEM.innerHTML;

    const ROOT_ELEM = this.shadowRoot.querySelector(rootSelector);
    */

    this.innerHTML = templateHtml;

    const ROOT_ELEM = this; // .querySelector(rootSelector);
    const SLOT_ELEM = ROOT_ELEM.querySelector(slotSelector);

    SLOT_ELEM.innerHTML = CONTENT;

    return ROOT_ELEM;
  }

  _addThemeStylesheet (theme) {
    const LINK = document.createElement('link');
    LINK.href = THEME_URL.replace('%{theme}', theme);
    LINK.rel = 'stylesheet';

    this.appendChild(LINK);
  }
}

MySlideDeckElement.define();
