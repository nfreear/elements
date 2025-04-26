/**
 * Base class for iframe-based media embeds, with player.js support.
 *
 * @copyright © Nick Freear, 20-April-2025.
 * @customElement my-iframe
 * @see https://github.com/embedly/player.js
 */
export class MyIframeElement extends window.HTMLElement {
  static getTag () { return 'my-iframe'; }

  get _anchorSelector () { return 'a[ href ]'; }

  get childAnchorElem () {
    const EL = this.querySelector(this._anchorSelector);
    console.assert(EL, `<a href="..."> - Required child element not found: ${this._anchorSelector}`);
    return EL;
  }

  /** Attributes. */
  get height () { return parseInt(this.getAttribute('height') || 390); }
  get width () { return parseInt(this.getAttribute('width')) || '100%'; } // '640',

  get debug () { return !!this.getAttribute('debug'); }

  get _embedUrl () { throw new Error('Implement in child class!'); }
  get _iframeTitle () { throw new Error('Implement in child class!'); }

  get _iframeAttr () {
    return {
      src: this._embedUrl,
      title: this._iframeTitle,
      part: 'iframe',
      width: this.width,
      height: this.height,
      frameborder: 0,
      allowfullscreen: '',
      allowtransparency: 'true',
      loading: 'lazy'
    };
  }

  _setupIframeElement () {
    const iframeEl = document.createElement('iframe');
    Object.entries(this._iframeAttr).forEach(([key, val]) => iframeEl.setAttribute(key, val));
    /* for (const [key, value] of Object.entries(this._iframeAttr)) {
      iframeEl.setAttribute(key, value); } */
    return iframeEl;
  }

  get _playerJsScript () {
    return `https://unpkg.com/player.js@0.1.0/dist/player-0.1.0${this.debug ? '' : '.min'}.js`;
  }

  get _playerJsLegacy () { return 'https://cdn.embed.ly/player-0.1.0.min.js'; }

  async _loadPlayerJs () {
    await import(this._playerJsScript);
    return window.playerjs;
  }

  async _loadPlayerJsLegacy () {
    const SCR = document.createElement('script');
    SCR.src = this._playerJsScript;
    const PR = new Promise((resolve, reject) => {
      SCR.onload = (ev) => setTimeout(() => resolve(window.playerjs), 100);
      SCR.onerror = (ev) => reject(new Error('Player.JS loading error!'));
    });
    this.shadowRoot.appendChild(SCR);
    return PR;
  }

  _attachPlayerJsListeners (playerjs, iframeElement) {
    console.debug('Player.js:', playerjs);
    const { Player } = playerjs;
    const player = new Player(iframeElement);

    player.on('ready', (R) => {
      this.dataset.ready = true;
      this._debug('playerjs - ready:', R);

      player.on('timeupdate', ({ seconds, duration }) => {
        this._debug('playerjs - timeupdate:', seconds, duration);
      });

      player.on('play', () => this._debug('playerjs - play'));
      player.on('pause', () => this._debug('playerjs - pause'));
    });

    return player;
  }

  _debug () {
    if (this.debug) { console.log(...arguments); }
  }
}

export default MyIframeElement;
