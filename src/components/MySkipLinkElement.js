/**
 * Add a "skip to main content" link which becomes visible on focus.
 *
 * @copyright Nick Freear, 08-Dec-2021.
 * @see ../demo/my-skip-link.html
 * @status beta, my blog
 * @since 1.0.0
 */

import { MyElement } from '../MyElement.js';

export class MySkipLinkElement extends MyElement {
  static getTag () {
    return 'my-skip-link';
  }

  async connectedCallback () {
    // this.setTagName('my-skip-link');

    // const href = this.getAttribute('href') || '#main-content';

    await this.getTemplate('my-skip-link');

    console.debug('my-skip-link:', this);
  }
}

MySkipLinkElement.define();

// Was: customElements.define('my-skip-link', MySkipLinkElement);
