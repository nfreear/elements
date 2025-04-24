
import MyIframeElement from './MyIframeElement.js';

/**
 * Embed a loom video.
 * @customElement my-loom-embed
 * @demo https://nfreear.github.io/elements/demo/my-loom-embed.html
 * @see https://dev.loom.com/docs/embed-sdk/api#oembed
 */
export class MyLoomEmbedElement extends MyIframeElement {
  static getTag () { return 'my-loom-embed'; }

  get _embedUrl () { return `https://www.loom.com/embed/${this.videoId}`; }

  get _urlRegex () { return /https:\/\/www.loom.com\/(embed|share)\/(\w{30,34})/; }

  get videoId () {
    const loomUrl = this.childAnchorElem.href;
    const M = loomUrl.match(this._urlRegex);
    console.assert(M, `Loom URL doesn't match: ${loomUrl}`);
    return M ? M[2] : null;
  }

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

  get _iframeAttr () {
    return {
      src: this._embedUrl,
      title: 'Loom player',
      part: 'iframe',
      width: this.width,
      height: this.height,
      frameborder: 0,
      allowfullscreen: ''
    };
  }

  _setupIframeElement () {
    const iframeEl = document.createElement('iframe');
    Object.entries(this._iframeAttr).forEach(([key, val]) => iframeEl.setAttribute(key, val));
    /* for (const [key, value] of Object.entries(this._iframeAttr)) {
      iframeEl.setAttribute(key, value); } */
    return iframeEl;
  }
}

export default MyLoomEmbedElement;
