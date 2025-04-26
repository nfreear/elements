
import MyIframeElement from './MyIframeElement.js';

/**
 * Embed a loom video.
 * @customElement my-loom-embed
 * @demo https://nfreear.github.io/elements/demo/my-loom-embed.html
 * @see https://dev.loom.com/docs/embed-sdk/api#oembed
 */
export class MyLoomEmbedElement extends MyIframeElement {
  static getTag () { return 'my-loom-embed'; }

  get _embedUrl () { return `https://www.loom.com/embed/${this.loom.id}`; }

  get _urlRegex () { return /https:\/\/www.loom.com\/(embed|share)\/(\w{30,34})/; }

  get loom () {
    const loomUrl = this.childAnchorElem.href;
    const text = this.childAnchorElem.textContent;
    const M = loomUrl.match(this._urlRegex);
    console.assert(M, `Loom URL doesn't match: ${loomUrl}`);
    return M ? { id: M[2], text } : null;
  }

  get _iframeTitle () { return `Loom: ${this.loom.text}`; }

  async connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });
    const slotElem = document.createElement('slot');

    const iframeElem = this._setupIframeElement();

    const playerjs = await this._loadPlayerJs();
    this._attachPlayerJsListeners(playerjs, iframeElem);

    shadow.appendChild(slotElem);
    shadow.appendChild(iframeElem);

    console.debug('my-loom-embed:', this._iframeAttr);
  }
}

export default MyLoomEmbedElement;
