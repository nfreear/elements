const { HTMLElement } = window;

/**
 * Add a "Skip to content" link, which becomes visible on keyboard focus.
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

  get #hrefRegex () { return /^#[\w_-]+$/; }

  get noAnimate () { return this.hasAttribute('no-animate'); }

  connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.appendChild(this.#styleElement);
    shadow.appendChild(this.#anchorElement);

    console.debug('my-skip-link:', this);
  }

  /** @return {string} */
  #testAndGetHref () {
    console.assert(this.#hrefRegex.test(this.href), `'href' - Unexpected value: ${this.href}`);
    const EL = document.querySelector(this.href);
    console.assert(EL, `Skip-link destination element - Not found: ${this.href}`);
    return this.href;
  }

  /** @return {HTMLAnchorElement} */
  get #anchorElement () {
    const anchorEl = document.createElement('a');
    anchorEl.textContent = this.text;
    anchorEl.href = this.#testAndGetHref();
    anchorEl.setAttribute('part', `a ${this.noAnimate ? 'no-' : ''}animate`);
    return anchorEl;
  }

  get #styleElement () {
    const styleEl = document.createElement('style');
    styleEl.textContent = this.#stylesheet;
    return styleEl;
  }

  /** @return {string} */
  get #stylesheet () {
    return `
a[ href ] {
  font: larger sans-serif;
  height: 1px;
  width: 1px;
  position: absolute;
  overflow: hidden;
  left: 3px;
  top: 3px;
}
a:focus {
  background: var(--my-skip-background, lightyellow); /* #ffffe0 */
  border: 3px solid darkorange;
  border-radius: .25rem;
  color: var(--my-skip-color, blue);
  height: auto;
  width: auto;
  padding: .6rem;
  transition: all .5s;
  /* Fix: ensure link appears on top of other absolute/relative content. */
  z-index: 999;
}
a[ part *= no-animate]:focus {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  a:focus {
    transition: none;
  }
}`;
  }
}

export default MySkipLinkElement;
