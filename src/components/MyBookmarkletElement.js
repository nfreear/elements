/**
 * Embed a bookmarklet Javascript.
 *
 * @copyright © Nick Freear, 23-Jan-2022.
 */

import { rainbowViaCdn } from '../external-cdn.js';
import { MyElement } from '../MyElement.js';

const { fetch } = window;

export class MyBookmarkletElement extends MyElement {
  static getTag () {
    return 'my-bookmarklet';
  }

  async connectedCallback () {
    const src = this.getAttribute('src') || null;
    const name = this.getAttribute('name') || 'Hello!';

    if (!src) {
      throw new Error("The 'src' attribute is required on <my-bookmarklet>");
    }

    await this.getTemplate('my-bookmarklet');

    const codeEl = this.shadowRoot.querySelector('pre code');
    const scriptLinkEl = this.shadowRoot.querySelector('#js-link');
    const nameEl = this.shadowRoot.querySelector('#name');

    const RESP = await fetch(src);
    const rawScript = await RESP.text();
    const markletScript = this._stripComments(rawScript);

    scriptLinkEl.href = this._markletScriptLink(markletScript);
    scriptLinkEl.addEventListener('click', ev => {
      ev.preventDefault();
      console.debug('my-bookmarklet - Click block:', ev);
    });
    nameEl.textContent = name;

    this._displayScript(codeEl, markletScript);

    console.debug('my-bookmarklet:', name, src, this);
  }

  async _displayScript (elem, markletScript) {
    const Rainbow = await rainbowViaCdn();

    Rainbow.color(markletScript, 'javascript', (hiCode) => {
      elem.innerHTML = hiCode;

      console.debug('Rainbow:', markletScript);
    });
  }

  _markletScriptLink (script) {
    return 'javascript:' + this._stripNewlinesSpaces(script);
  }

  _stripComments (script) {
    const RES = script.match(/\/\*\*?([^/]+)\*\//m);
    console.debug('Regex:', RES);

    return script.replace(/\/\*\*?([^/]+)\*\/\n+/mg, '');
  }

  _stripNewlinesSpaces (script) {
    return script.replace(/\n/g, '').replace(/[ ]{2,}/g, ' ');
  }
}

MyBookmarkletElement.define();
