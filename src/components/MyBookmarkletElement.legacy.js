/**
 * @legacy Embed a bookmarklet Javascript.
 *
 * @copyright © Nick Freear, 23-Jan-2022.
 * @customElement my-bookmarklet-legacy
 * @see ../demo/my-bookmarklet.html
 * @class MyBookmarkletElement
 * @status legacy
 */

import MyElement from '../MyElement.js';

const { fetch, location } = window;

export class MyBookmarkletElement extends MyElement {
  static getTag () {
    return 'my-bookmarklet';
  }

  get name () { return this.getAttribute('name') || this.textContent || 'Bookmarklet'; }

  get originPlaceholder () { return '{__ORIGIN__}'; }

  get _bookmarkletScriptJs () { return '../BookmarkletScript.js'; }
  get _externalCdnJs () { return '../external-cdn.js'; }

  fromFunction (theFunction) {
    console.assert(typeof theFunction === 'function');
    const EL = document.createElement('a');
    const FUNC = theFunction.toString();
    const BODY = FUNC.slice(FUNC.indexOf('{') + 1, FUNC.lastIndexOf('}'));
    const SCRIPT = this._fixScriptUrl(BODY);

    EL.href = `javascript:${SCRIPT}`;
    EL.textContent = this.name;
    EL.setAttribute('part', 'a');
    this.attachShadow({ mode: 'open' }).appendChild(EL);
    console.debug(`my-bookmarklet. From function - "${this.name}":`, SCRIPT);
  }

  _fixScriptUrl (script) {
    return script.replace(this.originPlaceholder, location.origin);
  }

  async connectedCallback () {
    const src = this.getAttribute('src') || null;
    const useTemplate = !this.getAttribute('no-template');

    if (!src) {
      return console.debug("my-bookmarklet: No 'src' attribute is specified.");
      // Was: throw new Error("The 'src' attribute is required on <my-bookmarklet>");
    }

    const { codeEl, scriptLinkEl, nameEl } = await this._loadBmTemplate(useTemplate);

    const RESP = await fetch(src);
    const rawScript = await RESP.text();
    // const markletScript = this._stripComments(rawScript);

    const { BookmarkletScript } = await import(this._bookmarkletScriptJs);
    const bookmarklet = new BookmarkletScript();
    const RES = await bookmarklet.parse(rawScript);

    scriptLinkEl.href = bookmarklet.scriptLink; // this._markletScriptLink(RES.minScript);

    nameEl.textContent = this.name;

    if (useTemplate) {
      this._displayScript(codeEl, RES.displayScript);
    }

    console.debug('my-bookmarklet:', this.name, src, RES, this);
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
    const { rainbowViaCdn } = await import(this._externalCdnJs);
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
