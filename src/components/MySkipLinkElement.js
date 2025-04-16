
const { HTMLElement } = window;

/**
 * Add a <q>skip to content</q> link, which becomes visible on focus.
 *
 * @copyright Nick Freear, 08-Dec-2021.
 * @customElement my-skip-link
 * @demo ../demo/my-skip-link.html
 * @status beta, my blog, accessibility
 * @since 1.0.0
 */
export class MySkipLinkElement extends HTMLElement {
  /** @return {string} */
  static getTag () { return 'my-skip-link'; }

  /** @return {string} */
  get text () { return this.textContent || 'Skip to main content'; }

  /** @return {string} */
  get href () { return this.getAttribute('href') || '#main-content'; }

  connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.appendChild(this._styleElement);
    shadow.appendChild(this._anchorElement);

    console.debug('my-skip-link:', this);
  }

  /** @return {string} */
  _testHref () {
    console.assert(/^#\w+$/.test(this.href), `'href' - Unexpected value: ${this.href}`);
    const EL = document.querySelector(this.href);
    console.assert(EL, `Skip-link destination element - Not found: ${this.href}`);
    return this.href;
  }

  /** @return {HTMLAnchorElement} */
  get _anchorElement () {
    const anchorEl = document.createElement('a');
    anchorEl.textContent = this.text;
    anchorEl.href = this._testHref();
    anchorEl.setAttribute('part', 'a');
    return anchorEl;
  }

  get _styleElement () {
    const styleEl = document.createElement('style');
    styleEl.textContent = this._stylesheet;
    return styleEl;
  }

  /** @return {string} */
  get _stylesheet () {
    return `
a[ href ] {
  font: 1.1rem sans-serif;
  height: 1px;
  width: 1px;
  position: absolute;
  overflow: hidden;
  left: 3px;
  top: 3px;
}
a:focus {
  background: var(--my-skip-background, lightyellow); /* #ffffe0 */
  border: 2px solid darkorange;
  border-radius: .25rem;
  color: blue;
  height: auto;
  width: auto;
  padding: .5rem;
  transition: all .5s;
  /* Fix: ensure link appears on top of other absolute/relative content. */
  z-index: 999;
}
`;
  }
}

export default MySkipLinkElement;
