const { HTMLElement } = window;

/**
 * Embed a Vimeo video, exposing the iframe element using `::part()`
 *
 * @customElement my-vimeo-embed
 * @see https://github.com/vimeo/player.js
 */
export class MyVimeoEmbedElement extends HTMLElement {
  #player;
  #duration;

  static getTag () { return 'my-vimeo-embed'; }

  get #height () { return parseInt(this.getAttribute('height') ?? 360); }
  get #width () { return parseInt(this.getAttribute('width') ?? 640); }
  get #doNotTrack () { return this.hasAttribute('dnt'); }

  get #videoTitle () { return this.#player.element.title; }

  get childAnchorElem () {
    const EL = this.querySelector('a[ href ]');
    console.assert(EL, 'Required child <A> element not found - <a href="https://vimeo..">');
    return EL;
  }

  get #urlRegex () { return /(vimeo.com)\/([\d]{8,})/; }

  get #video () {
    const url = this.childAnchorElem.href;
    const text = this.childAnchorElem.textContent;
    const M = url.match(this.#urlRegex);
    console.assert(M, `Vimeo URL doesn't match: ${url}`);
    return M ? { id: parseInt(M[2]), text, url } : null;
  }

  async connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });
    // const slotElem = document.createElement('slot');
    const divElem = document.createElement('div');

    // shadow.appendChild(slotElem);
    shadow.appendChild(divElem);

    try {
      await this.#createPlayer(divElem);
    } catch (err) {
      this.#handleError(err);
    }
  }

  async #createPlayer (divElem) {
    const { default: Player } = await import('@vimeo/player');

    const player = this.#player = new Player(divElem, {
      id: this.#video.id,
      height: this.#height,
      width: this.#width,
      dnt: this.#doNotTrack,
    });

    player.on('error', (ev) => this.#handleError(ev));

    player.on('play', (ev) => console.debug('Vimeo: played the video!', ev));

    player.on('timeupdate', (ev) => console.debug('timeupdate:', ev));

    await player.ready();
    this.dataset.ready = true;

    this.#duration = await this.#player.getDuration();

    player.element.setAttribute('part', 'iframe');

    console.debug('Vimeo player ready:', [this], Player.prototype);
    // player.ready().then(() => console.debug('Vimeo player ready:', [this]));
    return player;
  }

  #handleError (err) {
    console.error('Vimeo Error.', [err]);
    this.dataset.error = err.message ?? err;
    this.title = `Vimeo Error: ${err.message ?? err}`;
    this.style = 'cursor:not-allowed;';
  }
}

export default MyVimeoEmbedElement;
