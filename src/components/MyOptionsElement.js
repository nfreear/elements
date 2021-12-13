/*!
  Options Element - set configuration options.

  © Nick Freear, 11-Dec-2021.
*/

import { MyElement } from '../MyElement.js';
import { setupOptions } from '../Options.js';

export class MyOptionsElement extends MyElement {
  constructor () {
    super();

    const templateHost = this.getAttribute('template-host') || 'local';

    this.$$ = { templateHost };

    setupOptions(this.$$);

    console.debug('my-options:', this.$$, this);
  }
}

customElements.define('my-options', MyOptionsElement);
