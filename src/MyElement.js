/*!
  Base class with functions to fetch templates, etc.

  © Nick Freear, 02-Dec-2021.
*/

export class MyElement extends HTMLElement {
  constructor() {
    super();

    if (!'content' in document.createElement('template')) {
      throw new Error('Template not supported!');
    }
  }

  // URL is relative to the HTML page!
  getTemplateUrl(id) {
    return `../src/components/${id}.tpl.html`;
  }

  // https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
  async getTemplate(id) {
    // const template = document.getElementById('my-map-template');
    // const templateContent = template.content;

    const url = this.getTemplateUrl(id);

    const resp = await fetch(url);
    const html = await resp.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const allTemplates = doc.querySelectorAll('template');

    const defaultTemplate = allTemplates[0];

    const root = defaultTemplate.content.cloneNode(true);

    this.attachShadow({mode: 'open'}).appendChild(root);

    console.debug('getTemplate (all):', allTemplates);

    return allTemplates;
  }

}
