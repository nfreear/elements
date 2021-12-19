/*!

  © Nick Freear, 08-Dec-2021.
*/

import { MyElement } from '../MyElement.js';

export class MySkipLinkElement extends MyElement {
  static getTag () {
    return 'my-skip-link';
  }

  constructor () {
    super();

    console.debug('MySkipLinkElement');

    // this.setTagName('my-skip-link');

    // const href = this.getAttribute('href') || '#main-content';

    // await
    this.getTemplate('my-skip-link');

    console.debug('my-skip-link:', this);
  }
}

MySkipLinkElement.define();

// Was: customElements.define('my-skip-link', MySkipLinkElement);
