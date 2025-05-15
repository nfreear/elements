/**
 * Present a deck of slides
 *
 * - powered by Reveal.js.
 *
 * @copyright © Nick Freear, 24-Sep-2022.
 * @customElement my-slide-deck
 * @demo ../demo/my-slide-deck.html
 * @see https://revealjs.com
 * @status alpha
 * @since 1.3.0
 */

import { MyElement } from '../MyElement.js';

// const REVEAL_MJS = 'https://cdn.skypack.dev/impress.js/dist/reveal.esm.js';
const REVEAL_MJS = 'https://unpkg.com/reveal.js@4.3.1/dist/reveal.esm.js';
const MARKDOWN_MJS = 'https://unpkg.com/reveal.js@4.3.1/plugin/markdown/markdown.esm.js';
const THEME_URL = 'https://unpkg.com/reveal.js@4.3.1/dist/theme/%{theme}.css';

const TEMPLATE = `
<template>
<link rel="stylesheet" href="https://unpkg.com/reveal.js@4.3.1/dist/reveal.css">
<link rel="X-stylesheet" href="https://unpkg.com/reveal.js@4.3.1/dist/theme/simple.css">
<style>
  my-slide-deck > section { display: none; }
  .reveal { display: block; height: 100vh; }
  .X.slides { transform: translate(-50%, 0) scale(0.8) !important; }
</style>

<div class="reveal">
  <div class="slides">
    <slot>
      <section data-markdown>
        # Slide 11
        * Bullet A.
        * Bullet B.
      </section>
    </slot>
  </div>
</div>
</template>
`;

export class MySlideDeckElement extends MyElement {
  static getTag () {
    return 'my-slide-deck';
  }

  async connectedCallback () {
    const { default: Reveal } = await import(REVEAL_MJS);
    const { default: Markdown } = await import(MARKDOWN_MJS);

    const theme = this.getAttribute('theme') || 'simple';

    const REVEAL_ELEM = this._attachLocalTemplateEx(TEMPLATE);

    this._addThemeStylesheet(theme);

    console.log('Reveal.js:', Reveal);

    const deck = new Reveal(REVEAL_ELEM, {
      // https://revealjs.com/config/
      controls: true,
      controlsTutorial: true,
      progress: true,
      slideNumber: true,
      hashOneBasedIndex: true,

      plugins: [Markdown]
    });

    const EV = await deck.initialize();

    console.debug('my-slide-deck: Impress.js ready:', deck, EV, this.dataset, this);
  }

  _attachLocalTemplateEx (templateHtml, rootSelector = '.reveal', slotSelector = '.slides') {
    const CONTENT = this.innerHTML;
    const attachShadow = false;

    this._attachLocalTemplate(templateHtml, attachShadow);

    const ROOT_ELEM = this; // .shadowRoot.querySelector(rootSelector);
    const SLOT_ELEM = ROOT_ELEM.querySelector(slotSelector);

    SLOT_ELEM.innerHTML = CONTENT;

    return this.querySelector(rootSelector);
  }

  _addThemeStylesheet (theme) {
    const LINK = document.createElement('link');
    LINK.href = THEME_URL.replace('%{theme}', theme);
    LINK.rel = 'stylesheet';

    this.appendChild(LINK);
  }
}
