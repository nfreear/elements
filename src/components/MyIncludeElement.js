const { HTMLElement } = globalThis;

/**
 * Inject HTML and SVG directly into a page via a temporary Iframe element.
 * Uses progressive enhancement!
 *
 * @customElement my-include
 * @see https://www.filamentgroup.com/lab/html-includes/
 * @see https://codepen.io/piccalilli/project/editor/DyVyPG
 * @see https://codepen.io/andybelldesign/project/full/DyVyPG
 * @see https://codepen.io/scottjehl/project/editor/XrzdYk
 * @see https://github.com/nfreear/editor/blob/main/src/ImportContentElement.js
 */
export class MyIncludeElement extends HTMLElement {
  #iframeSrc;

  static getTag () { return 'my-include'; } // Was: 'my-import-content'

  get #iframe () { return this.querySelector('iframe[ src ]'); }

  connectedCallback () {
    console.assert(this.#iframe, 'Missing required <iframe> child element');

    const children = [...this.#iframe.contentDocument.body.children];

    children.forEach((child) => this.#iframe.before(child));

    this.#iframeSrc = this.#iframe.src;
    console.debug('import-content:', [this]);

    this.#iframe.remove();
  }
}

export default MyIncludeElement;
