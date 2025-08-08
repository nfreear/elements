import MyIframeElement from './MyIframeElement.js';

/**
 * Embed a CodePen
 * @customElement my-codepen-embed
 * @demo
 * @see https://blog.codepen.io/documentation/embedded-pens/
 */
export class MyCodepenEmbedElement extends MyIframeElement {
  static getTag () { return 'my-codepen-embed'; }

  get preview () { return this.hasAttribute('preview') ? 'preview/' : ''; }

  get _tabRegex () { return /^(html|css|js|result)(,result)?$/; }

  get defaultTab () {
    const TAB = this.getAttribute('default-tab') || 'result';
    console.assert(this._tabRegex.test(TAB), `Unexpected "default-tab" attribute: ${TAB}`);
    return TAB;
  }

  get _anchorSelector () { return 'a[ href ^= "https://codepen.io" ]'; }

  get _embedUrl () {
    return `https://codepen.io/${this.pen.userId}/embed/${this.preview}${this.pen.id}?default-tab=${this.defaultTab}`;
  }

  get _urlRegex () { return /https:\/\/codepen.io\/(\w+)\/(pen|details|full|embed)\/(\w{6,})/; }

  get pen () {
    const penUrl = this.childAnchorElem.href;
    const text = this.childAnchorElem.textContent;
    const M = penUrl.match(this._urlRegex);
    console.assert(M, `CodePen URL doesn't match: ${penUrl}`);
    return M ? { userId: M[1], id: M[3], text } : null;
  }

  get _iframeTitle () { return `CodePen: ${this.pen.text}`; }

  connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });
    const slotElem = document.createElement('slot');

    const iframeElem = this._setupIframeElement();

    shadow.appendChild(slotElem);
    shadow.appendChild(iframeElem);

    console.debug('my-codepen-embed:', this.pen, this._iframeAttr);
  }
}

export default MyCodepenEmbedElement;
