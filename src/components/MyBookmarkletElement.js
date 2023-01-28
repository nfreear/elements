/**
 * Embed a bookmarklet Javascript.
 *
 * @copyright © Nick Freear, 23-Jan-2022.
 *
 * @see ../demo/my-bookmarklet.html
 * @class MyBookmarkletElement
 */

import { rainbowViaCdn } from '../external-cdn.js';
import { MyElement } from '../MyElement.js';
import { BookmarkletScript } from '../BookmarkletScript.js';

const { fetch } = window;

export class MyBookmarkletElement extends MyElement {
  static getTag () {
    return 'my-bookmarklet';
  }

  async connectedCallback () {
    const src = this.getAttribute('src') || null;
    const name = this.getAttribute('name') || this.textContent || 'Bookmarklet';
    const useTemplate = !this.getAttribute('no-template');

    if (!src) {
      throw new Error("The 'src' attribute is required on <my-bookmarklet>");
    }

    const { codeEl, scriptLinkEl, nameEl } = await this._loadBmTemplate(useTemplate);

    const RESP = await fetch(src);
    const rawScript = await RESP.text();
    // const markletScript = this._stripComments(rawScript);

    const bookmarklet = new BookmarkletScript();
    const RES = await bookmarklet.parse(rawScript);

    scriptLinkEl.href = bookmarklet.scriptLink; // this._markletScriptLink(RES.minScript);

    nameEl.textContent = name;

    if (useTemplate) {
      this._displayScript(codeEl, RES.displayScript);
    }

    console.debug('my-bookmarklet:', name, src, RES, this);
  }

  async _loadBmTemplate (useTemp) {
    const ANC = document.createElement('a');

    if (useTemp) {
      await this.getTemplate('my-bookmarklet');
    } else {
      ANC.part = 'a';
      this.attachShadow({ mode: 'open' }).appendChild(ANC);
    }

    const codeEl = useTemp ? this.shadowRoot.querySelector('pre code') : null;
    const scriptLinkEl = useTemp ? this.shadowRoot.querySelector('#js-link') : ANC;
    const nameEl = useTemp ? this.shadowRoot.querySelector('#name') : ANC;

    scriptLinkEl.addEventListener('click', ev => {
      ev.preventDefault();
      console.debug('my-bookmarklet - Click block:', ev);
    });

    return { codeEl, scriptLinkEl, nameEl };
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

    return script; // .replace(/\/\*\*?([.\n]+)\*\/\n+/mg, '');
  }

  _stripNewlinesSpaces (script) {
    return script.replace(/\n/g, '').replace(/[ ]{2,}/g, ' ');
  }
}

MyBookmarkletElement.define();
