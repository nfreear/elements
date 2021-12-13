/*!

  © Nick Freear, 08-Dec-2021.
*/

import { MyElement } from '../MyElement.js';

export class MySkipLinkElement extends MyElement {
  constructor () {
    super();
    // this.setTagName('my-skip-link');

    // const href = this.getAttribute('href') || '#main-content';

    // await
    this.getTemplate('my-skip-link');

    console.debug('my-skip-link:', this);
  }
}

// MySkipLinkElement.define();

customElements.define('my-skip-link', MySkipLinkElement);
