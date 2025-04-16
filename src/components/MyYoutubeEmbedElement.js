
const { HTMLElement } = window;

/**
 * Embed a YouTube video, exposing YT's iframe API.
 *
 * @customElement my-youtube-embed
 * @demo example/index.html
 * @see https://developers.google.com/youtube/iframe_api_reference
 *
 * <my-youtube-embed>
 *   <a href="https://youtu.be/M7lc1UVf-VE">Video</a>
 * </my-youtube-embed>
 */
export class MyYoutubeEmbedElement extends HTMLElement {
  static getTag () { return 'my-youtube-embed'; }

  get childAnchorElem () {
    const EL = this.querySelector('a[ href ]');
    console.assert(EL, '<a href="https://youtube.."> - Not found (required child element)');
    return EL;
  }

  get _ytJavaScript () { return 'https://www.youtube.com/iframe_api'; }

  get _urlRegex () { return /(youtu.be\/|youtube.com\/watch\?v=)(.+)/; }

  get videoId () {
    const ytUrl = this.childAnchorElem.href;
    const M = ytUrl.match(this._urlRegex);
    console.assert(M, `YouTube URL doesn't match: ${ytUrl}`);
    return M ? M[2] : null;
  }

  get height () { return parseInt(this.getAttribute('height') || 390); }
  get width () { return parseInt(this.getAttribute('width')) || '100%'; } // '640',

  async connectedCallback () {
    const shadow = this.attachShadow({ mode: 'open' });
    const slotElem = document.createElement('slot');
    const divElem = document.createElement('div');

    shadow.appendChild(slotElem);
    shadow.appendChild(divElem);

    this._onYouTubeIframeAPIReady(divElem);

    await this._loadJavascript(shadow);
  }

  _onYouTubeIframeAPIReady (playerElem) {
    window.onYouTubeIframeAPIReady = () => {
      const { YT } = window;
      console.debug('onYouTubeIframeAPIReady:', YT.PlayerState, YT);
      this._player = new YT.Player(playerElem, { // 'player', {
        height: this.height,
        width: this.width, // '640',
        videoId: this.videoId, // 'M7lc1UVf-VE',
        playerVars: {
          playsinline: 1
        },
        events: {
          onReady: (ev) => this._onPlayerReady(ev),
          onStateChange: (ev) => this._onPlayerStateChange(ev)
        }
      });
    };
  }

  _onPlayerReady (ev) {
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
  }

  _onPlayerStateChange (ev) {
    const STATE = this._state(ev.data);
    console.debug('onPlayerStateChange:', STATE.text, ev);
  }

  _state (id) {
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

  async _loadJavascript (parent) {
    // return await import('https://www.youtube.com/iframe_api');
    const SCRIPT = document.createElement('script');
    SCRIPT.src = this._ytJavaScript;
    parent.appendChild(SCRIPT);
  }
}

export default MyYoutubeEmbedElement;

// customElements.define('my-youtube-embed', MyYoutubeEmbedElement);
