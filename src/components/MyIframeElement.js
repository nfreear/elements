/**
 * Base class for iframe-based media embeds, with player.js support.
 *
 * @copyright © Nick Freear, 20-April-2025.
 * @customElement my-iframe
 * @see https://github.com/embedly/player.js
 */
export class MyIframeElement extends window.HTMLElement {
  static getTag () { return 'my-iframe'; }

  get childAnchorElem () {
    const EL = this.querySelector('a[ href ]');
    console.assert(EL, '<a href="https://..."> - Required child element not found.');
    return EL;
  }

  get height () { return parseInt(this.getAttribute('height') || 390); }
  get width () { return parseInt(this.getAttribute('width')) || '100%'; } // '640',

  get debug () { return !!this.getAttribute('debug'); }

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
      console.debug('playerjs - ready:', R);

      player.on('timeupdate', ({ seconds, duration }) => {
        this._debug('playerjs - timeupdate:', seconds, duration);
      });

      player.on('play', () => this._debug('playerjs - play'));
      player.on('pause', () => this._debug('playerjs - pause'));
    });
  }

  _debug () {
    if (this.debug) { console.log(...arguments); }
  }
}

export default MyIframeElement;
