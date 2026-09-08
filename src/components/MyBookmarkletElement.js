const { customElements, HTMLElement, location } = window;

/**
 * Embed a link to install a bookmarklet Javascript.
 *
 * @copyright © Nick Freear, 23-Jan-2022.
 * @demo ../demo/my-bookmarklet.html
 * @customElement my-bookmarklet
 */
export class MyBookmarkletElement extends HTMLElement {
  static getTag () { return 'my-bookmarklet'; }

  /** 'name' attribute.
   *  @return {string}
   */
  get name () { return this.getAttribute('name') ?? this.textContent ?? 'Bookmarklet'; }

  get #hint () { return this.getAttribute('hint') ?? 'Bookmarklet. Drag to your browser\'s bookmarks bar.'; }

  get #originPlaceholder () { return '{__ORIGIN__}'; }

  constructor () {
    super();
    const styleElem = this.#createStyleElement();
    this.attachShadow({ mode: 'open' }).appendChild(styleElem);
  }

  /** Load the bookmarklet source code into the link from a function.
   *  @param {function} theFunction
   */
  fromFunction (theFunction) {
    console.assert(typeof theFunction === 'function', 'Expecting function as parameter.');
    const EL = document.createElement('a');
    const BODY = this.#extractFunctionBody(theFunction);
    const SCRIPT = this.#fixScriptUrl(BODY);

    EL.href = `javascript:${SCRIPT}`;
    EL.textContent = this.name;
    EL.setAttribute('part', 'a');
    this.shadowRoot.appendChild(EL);

    const popover = this.#createPopoverElement(EL);

    this.shadowRoot.appendChild(popover);

    console.debug(`my-bookmarklet. From function - "${this.name}":`, SCRIPT);
  }

  /** Get the body of the source function.
   * @param {function} theFunction
   * @return {string}
   */
  #extractFunctionBody (theFunction) {
    const fnString = theFunction.toString();
    return fnString.slice(fnString.indexOf('{') + 1, fnString.lastIndexOf('}'));
  }

  #fixScriptUrl (script) {
    return script.replace(this.#originPlaceholder, location.origin);
  }

  connectedCallback () {
    console.debug('my-bookmarklet:', this.name, this);
  }

  #createPopoverElement (triggerElem) {
    const popoverID = 'popoverID';
    const popoverElem = document.createElement('div');

    popoverElem.id = popoverID;
    popoverElem.textContent = this.#hint;
    popoverElem.setAttribute('popover', '');

    triggerElem.setAttribute('interestfor', popoverID);
    triggerElem.setAttribute('aria-describedby', popoverID);
    return popoverElem;
  }

  #createStyleElement () {
    const elem = document.createElement('style');
    elem.textContent = `
  :host {}
  a[href] {
    background: #def;
    border: 3px dotted #999;
    border-radius: .2rem;
    cursor: copy;
    display: block;
    font-size: larger;
    padding: .5rem;
    margin: var(--my-bm-margin, 2rem 0);
    outline-offset: .3rem;
    text-align: center;
  }
  [popover] {
    --pale-yellow: #ffffe0;
    background: var(--my-bm-popover-background, var(--pale-yellow));
    border: 1px dotted currentColor;
    border-radius: .3rem;
    cursor: help;
    font-size: small;
    margin: .2rem 0;
    min-width: 10rem;
    padding: .5rem;
    position-area: var(--my-bm-popover-position, bottom center);
  }`;
    return elem;
  }
}

if (import.meta.url.includes('define')) {
  customElements.define('my-bookmarklet', MyBookmarkletElement);
}
