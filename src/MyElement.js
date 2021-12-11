/*!
  Base class with functions to fetch templates, etc.

  © Nick Freear, 02-Dec-2021.
*/

import { getOpt } from './components/MyOptionsElement.js';

export class MyElement extends HTMLElement {
  constructor() {
    super();

    if (!'content' in document.createElement('template')) {
      throw new Error('Template not supported!');
    }
  }

  // URL is relative to the HTML page!
  getTemplateUrl(id) {
    // const { templateHost } = getOptions();
    const BASE = getOpt('templateHost') === 'github.io' ? 'https://nfreear.github.io/web-components' : '..';

    return `${BASE}/src/components/${id}.tpl.html`;
  }

  // https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
  async getTemplate(tag, id = null) {
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

    this.attachShadow({mode: 'open'}).appendChild(root);

    console.debug('getTemplate (all):', url, allTemplates);

    return allTemplates;
  }

}
