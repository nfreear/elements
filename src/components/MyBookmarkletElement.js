/**
 * Embed a bookmarklet Javascript.
 *
 * @copyright © Nick Freear, 23-Jan-2022.
 *
 * @see ../demo/my-bookmarklet.html
 * @class MyBookmarkletElement
 */

const { HTMLElement, location } = window;

export class MyBookmarkletElement extends HTMLElement {
  static getTag () {
    return 'my-bookmarklet';
  }

  get name () { return this.getAttribute('name') || this.textContent || 'Bookmarklet'; }

  get originPlaceholder () { return '{__ORIGIN__}'; }

  fromFunction (theFunction) {
    console.assert(typeof theFunction === 'function', 'Expecting function as parameter.');
    const EL = document.createElement('a');
    const FUNC = theFunction.toString();
    const BODY = FUNC.slice(FUNC.indexOf('{') + 1, FUNC.lastIndexOf('}'));
    const SCRIPT = this._fixScriptUrl(BODY);

    EL.href = `javascript:${SCRIPT}`;
    EL.textContent = this.name;
    EL.setAttribute('part', 'a');
    this.attachShadow({ mode: 'open' }).appendChild(EL);
    console.debug(`my-bookmarklet. From function - "${this.name}":`, SCRIPT);
  }

  _fixScriptUrl (script) {
    return script.replace(this.originPlaceholder, location.origin);
  }

  async connectedCallback () {
    console.debug('my-bookmarklet:', this.name, this);
  }
}
