/**
 * Lorem Ipsum placeholder text.
 *
 * @copyright © Nick Freear, 09-Dec-2021.
 */

import { MyElement } from '../MyElement.js';

const DEFAULT_PARAS = 4;

export class MyLoremIpsumElement extends MyElement {
  static getTag () {
    return 'my-lorem-ipsum';
  }

  async connectedCallback () {
    const paras = parseInt(this.getAttribute('paras') || DEFAULT_PARAS);

    await this.getTemplate('my-lorem-ipsum');

    this._addClasses(paras);

    console.debug('my-lorem-ipsum:', paras, this);
  }

  _addClasses (paras) {
    const ELEM = this.shadowRoot.querySelector('article');

    for (let idx = 1; idx <= paras; idx++) {
      ELEM.classList.add(`n${idx}`);
    }
    // [...Array(paras).keys()].forEach(idx => ELEM.classList.add(`n${idx + 1}`))
  }
}

MyLoremIpsumElement.define();
