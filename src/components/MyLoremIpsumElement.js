/*!

  © Nick Freear, 09-Dec-2021.
*/

import { MyElement } from '../MyElement.js';

export class MyLoremIpsumElement extends MyElement {
  constructor () {
    super();

    // const name = this.getAttribute('name') || 'A Name attribute';

    // await
    this.getTemplate('my-lorem-ipsum');

    console.debug('my-lorem-ipsum:', this);
  }
}

customElements.define('my-lorem-ipsum', MyLoremIpsumElement);
