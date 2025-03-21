/**
 * MyMinElement - minimal base class with functions to attach local templates, etc.
 *
 * @see https://github.com/nfreear/elements
 * @copyright © Nick Freear, 02-Dec-2021.
 * @license MIT
 * @class MyMinElement
 * @status beta
 * @since 1.7.0
 */
const { DOMParser, HTMLElement } = window;

export class MyMinElement extends HTMLElement {
  constructor () {
    super();

    /* eslint-disable-next-line */
    if (!'content' in document.createElement('template')) {
      throw new Error('Template not supported!');
    }
  }

  static getTag () {
    throw new Error('getTag() should be implemented in the child class!');
  }

  /**
   * Attach HTML template from local JS file.
   * @security Safer than `innerHTML`
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

  async _sleep (sleepMs = 200, value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), sleepMs)); // callbackFunc(value));
  }
}

export default MyMinElement;
