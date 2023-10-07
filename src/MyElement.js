/**
 * MyElement - base class with functions to fetch templates, etc.
 *
 * @see https://github.com/nfreear/elements
 * @copyright © Nick Freear, 02-Dec-2021.
 * @license MIT
 *
 * @class MyElement
 * @status beta
 * @since 1.0.0
 */

// import { getOpt } from './Options.js';
const OPTIONS_MJS = './Options.js';

const CHANNEL_NAME = 'ndf-elements-internal';
const UNPKG = 'https://unpkg.com/ndf-elements@';
// Was: const UNPKG = `https://unpkg.com/ndf-elements@${getOpt('version')}`;
const PURIFY_JS = 'https://unpkg.com/dompurify@2.4.0/dist/purify.min.js';

const { BroadcastChannel, customElements, DOMParser, fetch, HTMLElement } = window;

export class MyElement extends HTMLElement {
  constructor () {
    super();

    /* eslint-disable-next-line */
    if (!'content' in document.createElement('template')) {
      throw new Error('Template not supported!');
    }
  }

  static getTag () {
    // Example: return 'my-element';
    throw new Error('getTag() should be implemented in the child class!');
  }

  static async define (name = null, options = null) {
    // await whenDOMReady();
    const klass = this;
    const NAME = name || klass.getTag();

    customElements.define(NAME, klass, options);
  }

  async _getOpt (key) {
    const { getOpt } = await import(OPTIONS_MJS);
    return getOpt(key);
  }

  async _getTemplateUrl (id) {
    const HOST = await this._getOpt('templateHost');

    // URL is relative to the HTML page!
    let BASE = /^https?:\//.test(HOST) ? HOST : '..';

    switch (HOST) {
      case 'ghp':
      case 'ghpages':
      case 'github.io':
        BASE = 'https://nfreear.github.io/elements'; // Was: 'web-components'
        break;
      case 'unpkg':
      case 'unpkg.com':
        BASE = UNPKG + await this._getOpt('version');
        break;
      // NO: default:
    }

    return `${BASE}/src/templates/${id}.tpl.html`;
  }

  /**
   * Fetch and attach HTML template from an external file.
   *
   * @see https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
   */
  async getTemplate (tag, id = null) {
    // const template = document.getElementById('my-map-template');
    // const templateContent = template.content;

    const url = await this._getTemplateUrl(tag);

    const resp = await fetch(url);
    const html = await resp.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const allTemplates = doc.querySelectorAll('template');

    const defaultTemplate = id ? [...allTemplates].find(t => t.id === id) : allTemplates[0];

    const root = defaultTemplate.content.cloneNode(true);

    this.attachShadow({ mode: 'open' }).appendChild(root);

    console.debug('getTemplate (all):', url, allTemplates);

    return allTemplates;
  }

  /**
   * Attach HTML template from local (M)JS file.
   *
   * Security: safer than `innerHTML`
   */
  _attachLocalTemplate (templateHtml, attachShadow = true) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateHtml, 'text/html');

    const template = doc.querySelector('template');
    const docFragment = template.content.cloneNode(true);

    if (attachShadow) {
      this.attachShadow({ mode: 'open' }).appendChild(docFragment);
    } else {
      this.appendChild(docFragment);
    }
    // return rootElem;
  }

  /**
   * If we do use `el.innerHTML` - prevent XSS attacks,
   * @see https://github.com/cure53/DOMPurify#dompurify
   */
  async _saferHtml (dirtyHtml, elem) {
    await import(PURIFY_JS);

    const { DOMPurify } = window;

    // Don't strip `part` attributes.
    const RES = DOMPurify.sanitize(dirtyHtml, { USE_PROFILES: { html: true }, ADD_ATTR: ['part'] });
    console.debug('DOMPurify:', DOMPurify.removed);

    if (elem) {
      elem.innerHTML = RES;
    }
    return RES;
  }

  _postMessage (data = {}, _type = null) {
    if (!this.channel) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }
    data.src = this.constructor.getTag(); // Call static function!
    data.type = _type || data.type;

    return this.channel.postMessage(data);
  }

  _onMessage (callbackFn) {
    if (!this.channel) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }

    this.channel.addEventListener('message', ev => callbackFn ? callbackFn(ev) : console.debug('Message:', ev));
  }

  get events () { return []; } // { sel: '#button', name: 'click', fn: '_clickHandler' }

  _addEventHandlers () {
    this.events.forEach((IT) => {
      const ELEM = this.shadowRoot.querySelector(IT.sel);
      const METHOD = this[IT.fn];
      if (!ELEM || typeof METHOD !== 'function') {
        throw new Error(`Add event handlers failed: '${IT.sel}' or '${IT.fn}'`);
      }
      ELEM.addEventListener(IT.name, (ev) => METHOD.call(this, ev));
    });
  }

  /** _whenReady: Wait for 'testCallbackFunc' to return truthy value, then resolve the promise.
   * @return Promise
   */
  async _whenReady (testCallbackFunc, reason, intervalMs = 250, timeoutMs = 2500) {
    console.assert(testCallbackFunc);
    return new Promise((resolve, reject) => {
      const toId = setTimeout (() => reject(`whenReady: ${reason}`), timeoutMs);
      const intId = setInterval(() => {
        const VALUE = testCallbackFunc();
        if (VALUE) {
          clearTimeout(toId)
          clearInterval(intId);
          resolve(VALUE);
        }
      }, parseInt(intervalMs));
    });
  }

  async _sleep (sleepMs = 200, value) {
    return new Promise(resolve => setTimeout(() => resolve(value), delayMs)); // callbackFunc(value));
  }

  /** Load non-module Javascript for side-effects (Leaflet added to window).
   */
  async _importJs (importArray) {
    const promises = importArray.map(async (js) => {
      return await import(js);
    });
    return await Promise.all(promises);
  }
}

export default MyElement;
