import MyMinElement from '../MyMinElement.js';

const { fetch } = window;

/**
 * Display transcript for an iframe-based embed (E.g. <my-loom-embed>)
 *
 * @copyright © Nick Freear, 20-April-2025.
 * @customElement my-transcript
 * @see https://github.com/plussub/srt-vtt-parser
 * @status experimental
 * @since 1.8.0
 */
export class MyTranscriptElement extends MyMinElement {
  static getTag () { return 'my-transcript'; }

  get open () { return this.hasAttribute('open') ? 'open' : ''; }

  get _template () {
    return `
<template>
  <style> [ part *= ' active' ] { border: 1px solid #b00; } </style>
  <details part="details" ${this.open}>
    <summary part="summary">Transcript</summary>
    <ol part="ol list"></ol>
  </details>
</template>
`;
  }

  get href () {
    const captionUrl = this.getAttribute('href');
    console.assert(captionUrl, 'href (captionUrl) - Attribute required.');
    return captionUrl;
  }

  get embedOrigin () {
    const _origin = this.getAttribute('embed-origin');
    return _origin ? new URL(_origin).origin : null;
    // console.assert(url, '"embed-origin" (iframe) - Attribute required.');
  }

  get _vttParserJs () { return 'https://unpkg.com/@plussub/srt-vtt-parser@^2/dist/index.js'; }

  async connectedCallback () {
    console.assert(this.embedOrigin, '"embed-origin" (iframe) - Attribute required for dynamic transcript.');

    await this._fetchAndParseCaptionFile();

    this._attachLocalTemplate(this._template);

    this._listItems = this._createCaptionElements();

    if (this.embedOrigin) {
      window.addEventListener('message', (ev) => this._onMessageEvent(ev));
    }
  }

  async _parseCaptions (data) {
    const { parse } = await import(this._vttParserJs);
    console.assert(parse, 'Expecting "parse" function.');

    const CAP = parse(data);
    console.assert(CAP && CAP.entries.length, 'Expecting VTT/SRT captions.');
    return CAP;
  }

  async _fetchAndParseCaptionFile () {
    const RESP = await fetch(this.href);
    if (!RESP.ok) {
      throw new Error(`Caption fetch error: ${RESP.status} ~ ${this.href}`);
    }
    const TEXT = await RESP.text();
    const CAP = await this._parseCaptions(TEXT);

    console.debug('my-transcript, Captions:', CAP.entries.length, CAP, this);
    this._captions = CAP.entries;
    return this._captions;
  }

  _createCaptionElements () {
    return this._captions.map(({ id, from, to, text }) => {
      const listItem = document.createElement('li');
      listItem.textContent = text;
      listItem.dataset.cid = id;
      listItem.dataset.from = from;
      listItem.dataset.to = to;
      this._listElement.appendChild(listItem);
      return listItem;
    });
  }

  _resetCaptionElements () {
    this._listItems.forEach((el) => { el.setAttribute('part', 'li inactive'); });
  }

  _queryCaptionElement (cid) {
    return this._listElement.querySelector(`[data-cid = "${cid}"]`);
  }

  get _listElement () {
    return this.shadowRoot.querySelector('ol');
  }

  _findCaption (seconds) {
    const millis = parseInt(1000 * seconds);
    return this._captions.find(({ from, to }) => millis >= from && millis <= to);
  }

  /** Relies on player.js on <iframe>
   * @see https://github.com/embedly/player.js
   */
  _onMessageEvent (ev) {
    if (ev.origin !== this.embedOrigin) { return; }

    const DATA = JSON.parse(ev.data);
    const { event, value } = DATA;

    if (event === 'timeupdate') {
      const { seconds } = value;
      const caption = this._findCaption(seconds);
      if (caption) {
        this._resetCaptionElements();
        const itemElem = this._queryCaptionElement(caption.id);
        itemElem.setAttribute('part', 'li active');
        // itemElem.dataset.active = true;

        console.debug('playerjs - Found:', seconds, caption);
      } else {
        console.error('playerjs - Not Found:', seconds);
      }
    }
    if (event === 'ready') {
      this.dataset.ready = true;
    }
  }
}

export default MyTranscriptElement;
