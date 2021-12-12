/*!
  Options Element - set configuration options.

  © Nick Freear, 11-Dec-2021.
*/

// import { MyElement } from '../MyElement.js';

const $_OPTIONS = { $$: {} };

export function getOpt (key = null) {
  return key && key in $_OPTIONS.$$ ? $_OPTIONS.$$[key] : $_OPTIONS.$$;
}

export class MyOptionsElement extends HTMLElement {
  constructor () {
    super();

    const templateHost = this.getAttribute('template-host') || 'local';

    $_OPTIONS.$$ = this.$$ = { templateHost };

    console.debug('my-options:', this.$$, this);
  }
}

customElements.define('my-options', MyOptionsElement);
