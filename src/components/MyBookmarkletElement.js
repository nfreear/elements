const { HTMLElement, location } = window;

/**
 * Embed a link to install a bookmarklet Javascript.
 *
 * @copyright © Nick Freear, 23-Jan-2022.
 *
 * @demo ../demo/my-bookmarklet.html
 * @customElement my-bookmarklet
 */
export class MyBookmarkletElement extends HTMLElement {
  static getTag () { return 'my-bookmarklet'; }

  /** 'name' attribute.
   *  @return {string}
   */
  get name () { return this.getAttribute('name') || this.textContent || 'Bookmarklet'; }

  get originPlaceholder () { return '{__ORIGIN__}'; }

  /** Load the bookmarklet source code into the link from a function.
   *  @param {function} theFunction
   */
  fromFunction (theFunction) {
    console.assert(typeof theFunction === 'function', 'Expecting function as parameter.');
    const EL = document.createElement('a');
    const BODY = this._extractFunctionBody(theFunction);
    const SCRIPT = this._fixScriptUrl(BODY);

    EL.href = `javascript:${SCRIPT}`;
    EL.textContent = this.name;
    EL.setAttribute('part', 'a');
    this.attachShadow({ mode: 'open' }).appendChild(EL);
    console.debug(`my-bookmarklet. From function - "${this.name}":`, SCRIPT);
  }

  /** Get the body of the source function.
   * @param {function} theFunction
   * @return {string}
   */
  _extractFunctionBody (theFunction) {
    const fnString = theFunction.toString();
    return fnString.slice(fnString.indexOf('{') + 1, fnString.lastIndexOf('}'));
  }

  _fixScriptUrl (script) {
    return script.replace(this.originPlaceholder, location.origin);
  }

  connectedCallback () {
    console.debug('my-bookmarklet:', this.name, this);
  }
}
