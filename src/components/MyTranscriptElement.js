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

  get _template () {
    return `
<template>
  <style> [ data-active = true] { border: 1px solid #b00; } </style>
  <details part="details">
    <summary part="summary">Transcript</summary>
    <ol part="ol"></ol>
  </details>
</template>
`;
  }

  /* get embedId () {
    const ID = this.getAttribute('embed-id');
    console.assert(ID, 'embed-id - Attribute required.');
    return ID;
  } */

  get href () {
    const captionUrl = this.getAttribute('href');
    console.assert(captionUrl, 'href (captionUrl) - Attribute required.');
    return captionUrl;
  }

  get origin () {
    const _origin = this.getAttribute('origin');
    console.assert(_origin, 'origin (iframe) - Attribute required.');
    return _origin;
  }

  get open () { return this.hasAttribute('open'); }

  get _vttParserJs () { return 'https://unpkg.com/@plussub/srt-vtt-parser@^2/dist/index.js'; }

  async connectedCallback () {
    await this._fetchAndParseCaptionFile();

    this._attachLocalTemplate(this._template);
    const detailsElem = this.shadowRoot.querySelector('details');
    detailsElem.open = this.open;

    this._listItems = this._createCaptionElements();

    window.addEventListener('message', (ev) => this._onMessageEvent(ev));

    console.debug('my-transcript:', this.href, this);
  }

  async _fetchAndParseCaptionFile () {
    const RESP = await fetch(this.href);
    if (!RESP.ok) {
      throw new Error(`Caption fetch error: ${RESP.status} ~ ${this.href}`);
    }
    const TEXT = await RESP.text();

    const { parse } = await import(this._vttParserJs);
    console.assert(parse, 'Expecting "parse" function.');

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
      listItem.dataset.cid = id;
      listItem.dataset.from = from;
      listItem.dataset.to = to;
      this._listElement.appendChild(listItem);
      return listItem;
    });
  }

  _resetCaptionElements () {
    this._listItems.forEach(it => { it.dataset.active = false; });
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
    if (ev.origin !== this.origin) { return; }

    const DATA = JSON.parse(ev.data);
    const { event, value } = DATA;

    if (event === 'timeupdate') {
      const { seconds } = value;
      const caption = this._findCaption(seconds);
      if (caption) {
        this._resetCaptionElements();
        const itemElem = this._queryCaptionElement(caption.id);
        itemElem.dataset.active = true;

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
