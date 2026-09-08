const { customElements, HTMLElement } = globalThis;

/**
 * Display a "Not production ready" warning.
 *
 * @license MIT
 * @copyright © Nick Freear, 12-Nov-2023.
 * @customElement my-dev-warning
 * @since 1.7.0
 */
export class MyDevWarningElement extends HTMLElement {
  static getTag () {
    return 'my-dev-warning';
  }

  #desc = 'The code in this example is not intended for production environments. It needs more testing!';

  get #pageStyle () { return this.hasAttribute('page-style'); }
  get #summary () { return this.getAttribute('summary') || 'Not production ready!'; }
  get #name () { return this.getAttribute('name') || 'My Elements'; }
  get #url () { return this.getAttribute('url') || 'https://github.com/nfreear/elements'; }
  get #licenseUrl () { return this.getAttribute('license-url') || 'https://github.com/nfreear/elements/blob/main/LICENSE.txt'; }
  get #licenseName () { return this.getAttribute('license') || 'MIT'; }
  get #poweredBy () { return this.getAttribute('powered-by') || 'Powered by '; }

  constructor () {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = this.#createStyleElement();
    const details = this.#createElements();
    root.appendChild(style);
    root.appendChild(details);
    console.debug('>> my-dev-warning:', [this]);
    console.debug('>>', this.#url);
  }

  connectedCallback () {
    if (this.#pageStyle) {
      const style = this.#createPageStyleElement();
      style.dataset.myDevWarning = true;
      document.head.appendChild(style);
    }
  }

  #createElement (tagName, text = '') {
    const element = document.createElement(tagName);
    element.textContent = text;
    return element;
  }

  #createElements () {
    const slot = this.#createElement('slot', this.#desc);
    const details = this.#createElement('details');
    const summary = this.#createElement('summary', this.#summary);
    const div = this.#createElement('div');
    const para = this.#createElement('p');
    const para2 = this.#createElement('p');
    const icon = this.#createElement('x-icon');
    const license = this.#createElement('x-license');
    const by = this.#createElement('x-by');
    const licenseAnchor = this.#createElement('a', this.#licenseName);
    const byAnchor = this.#createElement('a', this.#name);
    const licenseNode = document.createTextNode('License: ');
    const byNode = document.createTextNode(this.#poweredBy);

    details.setAttribute('part', 'details');
    icon.setAttribute('part', 'icon');

    licenseAnchor.target = '_top';
    licenseAnchor.href = this.#licenseUrl;
    byAnchor.href = this.#url;
    byAnchor.target = '_top';

    details.appendChild(summary);
    details.appendChild(div);

    para.appendChild(icon);
    para.appendChild(slot);
    para2.appendChild(license);
    para2.appendChild(by);

    license.appendChild(licenseNode);
    license.appendChild(licenseAnchor);
    by.appendChild(byNode);
    by.appendChild(byAnchor);

    div.appendChild(para);
    div.appendChild(para2);

    return details;
  }

  #createStyleElement () {
    return this.#createElement('style', `
  details {
    background: var(--my-dev-background, #faf6f3); /* Was: #ffcc99; #ffefe7; */
    border-radius: .25rem;
    color: var(--my-dev-color, #b15010); /* Alloy Orange #c46210 */
    font-family: var(--my-dev-font, serif);
    margin: var(--my-dev-margin, 1.5rem 0);
    max-width: var(--my-dev-max-width, 32rem);
  }
  details > * {
    border: 1px solid currentColor;
    border-radius: .25rem;
    padding: .5rem;
  }
  details > div {
    border-top: 0;
    padding: .5rem .5rem 0;
  }
  p { margin: 0 0 .9rem; }
  x-by { float: right; }
  x-icon::after {
    content: var(--my-dev-icon, '⚠️');
    float: left;
    font-size: var(--my-dev-icon-size, 2rem);
    margin-right: .3rem;
    X-vertical-align: top;
  }
  * {
    outline-offset: .2rem;
    text-underline-offset: .2rem;
  }`);
  }

  #createPageStyleElement () {
    return this.#createElement('style', `
  body {
    background: #222;
    color: #f8f8f8;
    font-family: sans-serif;
    margin: auto;
    max-width: 36rem;
    padding: 1rem;
  }
  a[href] {
    color: #acf;
  }
  button {
    font-size: inherit;
    padding: .3rem 1rem;
  }
  * {
    outline-offset: .2rem;
    text-underline-offset: .2rem;
  }`);
  }
}

if (import.meta.url.includes('define')) {
  customElements.define('my-dev-warning', MyDevWarningElement);
}

export default MyDevWarningElement;
