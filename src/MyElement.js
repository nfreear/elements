/**
 * My Elements.
 *
 * MyElement - base class with functions to fetch templates, etc.
 *
 * @see https://github.com/nfreear/web-components
 * @copyright © Nick Freear, 02-Dec-2021.
 * @license MIT
 */

import { getOpt } from './Options.js';

const CHANNEL_NAME = 'ndf-elements-internal';
const UNPKG = `https://unpkg.com/ndf-elements@${getOpt('version')}`;

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

  _getTemplateUrl (id) {
    const HOST = getOpt('templateHost');

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
        BASE = UNPKG;
        break;
      // NO: default:
    }

    return `${BASE}/src/components/${id}.tpl.html`;
  }

  /**
   * Fetch and attach HTML template from an external file.
   *
   * @see https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
   */
  async getTemplate (tag, id = null) {
    // const template = document.getElementById('my-map-template');
    // const templateContent = template.content;

    const url = this._getTemplateUrl(tag);

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

  _postMessage (data = {}, _type = null) {
    if (!this.channel) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }
    data.src = this.getTag();
    data.type = _type || data.type;

    return this.channel.postMessage(data);
  }

  _onMessage (callbackFn) {
    if (!this.channel) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }

    this.channel.addEventListener('message', ev => callbackFn ? callbackFn(ev) : console.debug('Message:', ev));
  }
}
