/*!
  Boilerplate template.

  © Nick Freear, 09-Dec-2021.
*/

import { MyElement } from '../MyElement.js';

export class MyFoobarElement extends MyElement {
  constructor () {
    super();

    // const name = this.getAttribute('name') || 'A name attribute';

    // await
    this.getTemplate('my-foobar');

    console.debug('my-foobar:', this);
  }
}

customElements.define('my-foobar', MyFoobarElement);
