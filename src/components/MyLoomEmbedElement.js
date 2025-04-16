
const { HTMLElement } = window;

/**
 * Embed a loom video.
 * @customElement my-loom-embed
 * @demo example/index.html
 * @see https://dev.loom.com/docs/embed-sdk/api#oembed
 */
export class MyLoomEmbedElement extends HTMLElement {
  static getTag () { return 'my-loom-embed'; }

  get childAnchorElem () {
    const EL = this.querySelector('a[ href ]');
    console.assert(EL, '<a href="https://www.loom.com.."> - Not found (required child element)');
    return EL;
  }

  get _embedUrl () { return `https://www.loom.com/embed/${this.videoId}`; }

  get _urlRegex () { return /https:\/\/www.loom.com\/(embed|share)\/(\w{30,34})/; }

  get videoId () {
    const loomUrl = this.childAnchorElem.href;
    const M = loomUrl.match(this._urlRegex);
    console.assert(M, `Loom URL doesn't match: ${loomUrl}`);
    return M ? M[2] : null;
  }

  get height () { return parseInt(this.getAttribute('height') || 320); }
  get width () { return parseInt(this.getAttribute('width')) || '100%'; } // '640',

  connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });
    const slotElem = document.createElement('slot');

    window.addEventListener('message', (msg) => this._onMessageEvent(msg));

    const iframeElem = this._setupIframeElement();

    shadow.appendChild(slotElem);
    shadow.appendChild(iframeElem);
  }

  _setupIframeElement () {
    const iframeEl = document.createElement('iframe');
    iframeEl.src = this._embedUrl;
    iframeEl.title = 'Loom Player';
    iframeEl.setAttribute('part', 'iframe');
    iframeEl.setAttribute('width', this.width);
    iframeEl.setAttribute('height', this.height);
    iframeEl.setAttribute('allowfullscreen', '');
    return iframeEl;
  }

  _onMessageEvent (ev) {
    if (ev.origin !== 'https://www.loom.com') {
      return;
    }
    const DATA = JSON.parse(ev.data);
    console.debug('Loom - message:', DATA.event, DATA, ev);
  }
}

export default MyLoomEmbedElement;
