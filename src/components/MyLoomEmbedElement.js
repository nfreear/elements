import MyIframeElement from './MyIframeElement.js';

const { fetch } = window;

/**
 * Embed a loom video.
 * @customElement my-loom-embed
 * @demo https://nfreear.github.io/elements/demo/my-loom-embed.html
 * @see https://dev.loom.com/docs/embed-sdk/api#oembed
 * @see https://support.loom.com/hc/en-us/articles/360002208317-How-to-embed-your-video-into-a-webpage
 */
export class MyLoomEmbedElement extends MyIframeElement {
  #oEmbed;
  #buttonElem;
  #player;

  static getTag () { return 'my-loom-embed'; }

  get _embedUrl () { return `https://www.loom.com/embed/${this.loom.id}?autoplay=true`; }

  get #oEmbedJsonUrl () { return `https://www.loom.com/v1/oembed?url=https%3A%2F%2Fwww.loom.com%2Fshare%2F${this.loom.id}&format=json`; }

  get #urlRegex () { return /https:\/\/www.loom.com\/(embed|share)\/(\w{30,34})/; }

  get loom () {
    const loomUrl = this.childAnchorElem.href;
    const text = this.childAnchorElem.textContent;
    const M = loomUrl.match(this.#urlRegex);
    console.assert(M, `Loom URL doesn't match: ${loomUrl}`);
    return M ? { id: M[2], text } : null;
  }

  get _iframeTitle () { return `Loom: ${this.loom.text}`; }

  async connectedCallback () {
    this.#oEmbed = await this.#fetchOEmbedData();
    this.#buttonElem = this.#createPlaceholderElement();

    const shadow = this.attachShadow({ mode: 'open' });
    const slotElem = document.createElement('slot');

    this.#buttonElem.addEventListener('click', (ev) => this.#onClickEvent(ev, shadow));

    shadow.appendChild(this.#createStyleElement());
    shadow.appendChild(slotElem);
    shadow.appendChild(this.#buttonElem);

    console.debug('my-loom-embed ~ oEmbed', this.#oEmbed);
    this.dataset.ready = true;
  }

  async #onClickEvent (ev, shadow) {
    ev.preventDefault();

    const iframeElem = this._setupIframeElement();

    // const playerjs = await this._loadPlayerJs();
    // this.#player = this._attachPlayerJsListeners(playerjs, iframeElem);

    this.#buttonElem.hidden = true;
    shadow.appendChild(iframeElem);

    // setTimeout(() => this.#player.play(), 1000); // Doesn't work!

    console.debug('my-loom-embed - click:', this._iframeAttr, ev);
  }

  #createPlaceholderElement () {
    const { title } = this.#oEmbed;
    const buttonElem = document.createElement('button'); // Was: 'input'
    /* inputElem.type = 'image';
    inputElem.src = thumbnail_url;
    inputElem.alt = `Launch Loom player - ${title}`;
    inputElem.style.width = this.width;
    inputElem.style.height = `${this.height}px`; */
    buttonElem.setAttribute('aria-label', `Launch Loom player - ${title}`);
    buttonElem.setAttribute('part', 'button placeholder');
    return buttonElem;
  }

  #createStyleElement () {
    const styleElem = document.createElement('style');
    styleElem.textContent = this.#stylesheet;
    return styleElem;
  }

  /**
  * @see https://en.wikipedia.org/wiki/Media_control_symbols
  */
  get #stylesheet () {
    return `
button {
  background-color: #eee;
  background-image: url(${this.#oEmbed.thumbnail_url});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  color: #444;
  cursor: pointer;
  position: relative;
}
button:hover {
  color: #000;
}
button::before {
  background: rgba(250,250,250, .8);
  border: 2px solid silver;
  border-radius: 50%;
  content: '▶' / '';
  font-size: 3rem;
  display: block;
  position: absolute;
  left: calc(50% - 3rem);
  top: calc(50% - 3rem);
  line-height: 2;
  x-padding: 1rem 0;
  text-align: center;
  height: 6rem;
  width: 6rem;
}
button,
iframe {
  border: 1px outset silver;
  border-radius: .5rem;
  height: ${this.height}px;
  width: ${this.width}; /* % */
}
`;
  }

  async #fetchOEmbedData (expectType = 'video') {
    const RESP = await fetch(this.#oEmbedJsonUrl);
    console.assert(RESP.ok, `Error fetching Loom oEmbed ${RESP.status}`);
    if (RESP.ok) {
      const oEmbed = await RESP.json();
      console.assert(oEmbed.version === '1.0', 'Unexpected oEmbed version');
      console.assert(oEmbed.type === expectType, `Unexpected oEmbed type: ${oEmbed.type}`);
      return oEmbed;
    }
    return RESP;
  }
}

export default MyLoomEmbedElement;
