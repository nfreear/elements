/**
 * My Options element - set configuration options.
 *
 * @copyright © Nick Freear, 11-Dec-2021.
 * @see ../demo/my-options.html
 * @status beta
 * @since 1.0.0
 */

import { MyElement } from '../MyElement.js';
import { setupOptions } from '../Options.js';

export class MyOptionsElement extends MyElement {
  static getTag () {
    return 'my-options';
  }

  async connectedCallback () {
    const templateHost = this.getAttribute('template-host') || 'local';
    const use = this.getAttribute('use');

    this.$$ = { templateHost, use };

    setupOptions(this.$$);

    console.debug('my-options:', this.$$, this);
  }
}

MyOptionsElement.define();
