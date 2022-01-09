/*!
  Base class with functions to fetch templates, etc.

  © Nick Freear, 02-Dec-2021.
*/

import { getOpt } from './Options.js';

const { customElements, DOMParser, fetch, HTMLElement } = window;

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

  static async define () {
    // await whenDOMReady();
    const klass = this;

    customElements.define(klass.getTag(), klass);
  }

  getTemplateUrl (id) {
    const HOST = getOpt('templateHost');

    // URL is relative to the HTML page!
    let BASE = /^https:\//.test(HOST) ? HOST : '..';

    switch (HOST) {
      case 'github.io':
        BASE = 'https://nfreear.github.io/web-components';
        break;
      case 'unpkg.com':
        BASE = 'https://unpkg.com/@ndf/web-components@1.0.0';
        break;
      // NO: default:
    }

    return `${BASE}/src/components/${id}.tpl.html`;
  }

  // https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
  async getTemplate (tag, id = null) {
    // const template = document.getElementById('my-map-template');
    // const templateContent = template.content;

    const url = this.getTemplateUrl(tag);

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
}
