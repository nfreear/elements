const { HTMLElement } = window;

/**
 * Embed a YouTube video, exposing YT's iframe API.
 *
 * @customElement my-youtube-embed
 * @demo https://nfreear.github.io/elements/demo/my-loom-embed.html
 * @see https://developers.google.com/youtube/iframe_api_reference
 *
 * <my-youtube-embed>
 *   <a href="https://youtu.be/M7lc1UVf-VE">Video</a>
 * </my-youtube-embed>
 */
export class MyYoutubeEmbedElement extends HTMLElement {
  #player;

  static getTag () { return 'my-youtube-embed'; }

  get childAnchorElem () {
    const EL = this.querySelector('a[ href ]');
    console.assert(EL, '<a href="https://youtube.."> - Required child element not found.');
    return EL;
  }

  get #ytJavaScript () { return 'https://www.youtube.com/iframe_api'; }

  // https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video
  get #urlRegex () { return /(youtu.be\/|youtube.com\/watch\?v=)([\w-_]{11,})/; }

  get #video () {
    const url = this.childAnchorElem.href;
    const text = this.childAnchorElem.textContent;
    const M = url.match(this.#urlRegex);
    console.assert(M, `YouTube URL doesn't match: ${url}`);
    return M ? { id: M[2], text, url } : null;
  }

  get height () { return parseInt(this.getAttribute('height') || 390); }
  get width () { return parseInt(this.getAttribute('width')) || '100%'; } // '640',

  async connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });
    const slotElem = document.createElement('slot');
    const divElem = document.createElement('div');

    shadow.appendChild(slotElem);
    shadow.appendChild(divElem);

    this.#onYouTubeIframeAPIReady(divElem);

    await this.#loadJavascript(shadow);
  }

  #onYouTubeIframeAPIReady (playerElem) {
    window.onYouTubeIframeAPIReady = () => {
      const { YT } = window;
      this.#player = new YT.Player(playerElem, {
        height: this.height,
        width: this.width,
        videoId: this.#video.id, // 'M7lc1UVf-VE',
        playerVars: {
          playsinline: 1
        },
        events: {
          onReady: (ev) => this.#onPlayerReady(ev),
          onStateChange: (ev) => this.#onPlayerStateChange(ev)
        }
      });
      console.debug('onYouTubeIframeAPIReady:', [this]);
      this.dataset.ready = true;
    };
  }

  get #YT () { return window.YT; }

  #onPlayerReady (ev) {
    const { target } = ev;
    const { videoId } = target.options;
    this.dataset.videoId = videoId;
    this.dataset.title = target.videoTitle;
    this.dataset.duration = target.getDuration();

    const iframeElem = target.g;
    iframeElem.setAttribute('part', 'iframe');

    // target.setPlaybackRate(2);
    const RATE = target.getPlaybackRate();
    console.debug('onPlayerReady:', RATE, videoId, ev);
    this.dataset.ready = true;
  }

  #onPlayerStateChange (ev) {
    const STATE = this.#state(ev.data);
    console.debug('onPlayerStateChange:', STATE.text, ev);
  }

  #state (id) {
    const STATES = [
      { id: 3, text: 'buffering' },
      { id: 5, text: 'cued' },
      { id: 0, text: 'ended' },
      { id: 2, text: 'paused' },
      { id: 1, text: 'playing' },
      { id: -1, text: 'unstarted' }
    ];
    const state = STATES.find(it => it.id === id);
    console.assert(state, `State - not found: ${id}`);
    return state;
  }

  async #loadJavascript (parent) {
    // return await import('https://www.youtube.com/iframe_api');
    const SCRIPT = document.createElement('script');
    SCRIPT.src = this.#ytJavaScript;
    parent.appendChild(SCRIPT);
  }
}

export default MyYoutubeEmbedElement;
