import MyMinElement from '../MyMinElement.js';

const { fetch } = window;

/**
 * My Transcript.
 *
 * @copyright © Nick Freear, 20-April-2025.
 * @customElement my-transcript
 * @status experimental
 * @since 1.8.0
 */
export class MyTranscriptElement extends MyMinElement {
  static getTag () { return 'my-transcript'; }

  get _template () {
    return `
<template>
  <style> [ data-active = true] { border: 1px solid red; } </style>
  <details part="details" open>
    <summary part="summary">Transcript</summary>
    <ol part="ol"></ol>
  </details>
</template>
`;
  }

  get embedId () {
    const ID = this.getAttribute('embed-id');
    console.assert(ID, 'embed-id - Attribute required.');
    return ID;
  }

  get href () {
    const captionUrl = this.getAttribute('href');
    console.assert(captionUrl, 'href (captionUrl) - Attribute required.');
    return captionUrl;
  }

  get _vttParserJs () { return 'https://unpkg.com/@plussub/srt-vtt-parser@^2/dist/index.js'; }

  get _playerJsScript () { return 'https://cdn.embed.ly/player-0.1.0.min.js'; }

  async connectedCallback () {
    await this._fetchAndParseCaptionFile();

    this._attachLocalTemplate(this._template);

    this._listItems = this._createCaptionElements();

    this._playerjs = await this._loadPlayerJs();
    this._runPlayerJs();

    console.debug('my-transcript:', this.href, this);
  }

  async _fetchAndParseCaptionFile () {
    const RESP = await fetch(this.href);
    if (!RESP.ok) {
      throw new Error(`Caption fetch error: ${RESP.status} ~ ${this.href}`);
    }
    const TEXT = await RESP.text();

    const { parse } = await import(this._vttParserJs);
    console.assert(parse, 'Expecting "parse" function');

    const CAP = parse(TEXT);
    console.assert(CAP && CAP.entries.length, 'Expecting VTT/SRT captions.');

    console.debug('Captions:', CAP.entries.length, CAP);
    this._captions = CAP.entries;
    return this._captions;
  }

  _createCaptionElements () {
    return this._captions.map(({ id, from, to, text }) => {
      const listItem = document.createElement('li');
      listItem.textContent = text;
      listItem.dataset.from = from;
      listItem.dataset.to = to;
      listItem.dataset.id = id;
      this._listElement.appendChild(listItem);
      return listItem;
    });
  }

  _resetCaptionElements () {
    this._listItems.forEach(it => { it.dataset.active = false; });
  }

  _queryCaptionElement (id) {
    return this._listElement.querySelector(`[data-id = "${id}"]`);
  }

  get _listElement () {
    return this.shadowRoot.querySelector('ol');
  }

  get _iframeElement () {
    const EL = document.getElementById(this.embedId);
    console.assert(EL && EL.tagName === 'IFRAME', 'iframe element expected.');
    return EL;
  }

  async _loadPlayerJs () {
    const SCR = document.createElement('script');
    SCR.src = this._playerJsScript;
    const PR = new Promise((resolve, reject) => {
      SCR.onload = (ev) => setTimeout(() => resolve(window.playerjs), 100);
      SCR.onerror = (ev) => reject(new Error('Player.JS loading error!'));
    });
    this.shadowRoot.appendChild(SCR);
    return PR;
  }

  _findCaption (seconds) {
    const millis = parseInt(1000 * seconds);
    return this._captions.find(({ from, to }) => millis >= from && millis <= to);
  }

  _runPlayerJs () {
    console.debug('Player.js:', this._playerjs);
    const { Player } = this._playerjs;
    const player = new Player(this._iframeElement);

    player.on('ready', (R) => {
      console.debug('playerjs - ready:', R);

      player.on('timeupdate', ({ seconds, duration }) => {
        const caption = this._findCaption(seconds);
        if (caption) {
          this._resetCaptionElements();
          const itemElem = this._queryCaptionElement(caption.id);
          itemElem.dataset.active = true;

          console.debug('playerjs - Found:', seconds, caption);
        } else {
          console.error('playerjs - Not Found:', seconds);
        }
      });
    });
  }
}

export default MyTranscriptElement;
