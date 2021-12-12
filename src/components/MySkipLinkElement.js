/*!

  © Nick Freear, 08-Dec-2021.
*/

import { MyElement } from '../MyElement.js';

export class MySkipLinkElement extends MyElement {
  constructor () {
    super();

    // const href = this.getAttribute('href') || '#main-content';

    // const template = document.getElementById('skip-link-template');
    // await
    this.getTemplate('my-skip-link');

    console.debug('my-skip-link:', this);
  }
}

customElements.define('my-skip-link', MySkipLinkElement);
