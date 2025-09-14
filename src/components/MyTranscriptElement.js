import attachTemplate from '../util/attachTemplate.js';
// import MyMinElement from '../MyMinElement.js';

const { fetch, HTMLElement } = window;

/**
 * Display transcript for an iframe-based embed (E.g. <my-loom-embed>)
 *
 * @copyright © Nick Freear, 20-April-2025.
 * @customElement my-transcript
 * @see https://github.com/plussub/srt-vtt-parser
 * @status my blog
 * @since 1.8.0
 */
export class MyTranscriptElement extends HTMLElement {
  #captions;
  #listItems;

  static getTag () { return 'my-transcript'; }

  get open () { return this.hasAttribute('open') ? 'open' : ''; }

  get #htmlTemplate () {
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

  get #vttParserJs () { return 'https://unpkg.com/@plussub/srt-vtt-parser@^2/dist/index.js'; }

  async connectedCallback () {
    console.assert(this.embedOrigin, '"embed-origin" (iframe) - Attribute required for dynamic transcript.');

    await this.#fetchAndParseCaptionFile();

    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);

    this.#listItems = this.#createCaptionElements();

    if (this.embedOrigin) {
      window.addEventListener('message', (ev) => this.#onMessageEvent(ev));
    }
  }

  async #parseCaptions (data) {
    const { parse } = await import(this.#vttParserJs);
    console.assert(parse, 'Expecting "parse" function.');

    const CAP = parse(data);
    console.assert(CAP && CAP.entries.length, 'Expecting VTT/SRT captions.');
    return CAP;
  }

  async #fetchAndParseCaptionFile () {
    const RESP = await fetch(this.href);
    if (!RESP.ok) {
      throw new Error(`Caption fetch error: ${RESP.status} ~ ${this.href}`);
    }
    const TEXT = await RESP.text();
    const CAP = await this.#parseCaptions(TEXT);

    console.debug('my-transcript, Captions:', CAP.entries.length, CAP, this);
    this.#captions = CAP.entries;
    return this.#captions;
  }

  #createCaptionElements () {
    return this.#captions.map(({ id, from, to, text }) => {
      const listItem = document.createElement('li');
      listItem.textContent = text;
      listItem.dataset.cid = id;
      listItem.dataset.from = from;
      listItem.dataset.to = to;
      this.#listElement.appendChild(listItem);
      return listItem;
    });
  }

  #resetCaptionElements () {
    this._listItems.forEach((el) => { el.setAttribute('part', 'li inactive'); });
  }

  #queryCaptionElement (cid) {
    return this.#listElement.querySelector(`[data-cid = "${cid}"]`);
  }

  get #listElement () {
    return this.shadowRoot.querySelector('ol');
  }

  #findCaption (seconds) {
    const millis = parseInt(1000 * seconds);
    return this.#captions.find(({ from, to }) => millis >= from && millis <= to);
  }

  /** Relies on player.js on <iframe>
   * @see https://github.com/embedly/player.js
   */
  #onMessageEvent (ev) {
    if (ev.origin !== this.embedOrigin) { return; }

    const DATA = JSON.parse(ev.data);
    const { event, value } = DATA;

    if (event === 'timeupdate') {
      const { seconds } = value;
      const caption = this.#findCaption(seconds);
      if (caption) {
        this.#resetCaptionElements();
        const itemElem = this.#queryCaptionElement(caption.id);
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
