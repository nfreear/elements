/**
 * Boilerplate template.
 *
 * @copyright © Nick Freear, 09-Dec-2021.
 */

import { MyElement } from '../MyElement.js';

export class MyFoobarElement extends MyElement {
  static getTag () {
    return 'my-foobar';
  }

  /* constructor () { // "Useless constructor"!
    super();
  } */

  async connectedCallback () {
    // const name = this.getAttribute('name') || 'A name attribute';

    await this.getTemplate('my-foobar');

    console.debug('my-foobar:', this);
  }
}

MyFoobarElement.define();

// Was: customElements.define('my-foobar', MyFoobarElement);
