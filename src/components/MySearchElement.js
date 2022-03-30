/**
 * Custom site search.
 *
 * @copyright © Nick Freear, 17-Mar-2022.
 *
 * @see https://cse.google.com/cse/all
 * @see https://developers.google.com/custom-search/docs/element
 */

import { MyElement } from '../MyElement.js';

export class MySearchElement extends MyElement {
  static getTag () {
    return 'my-search';
  }

  async connectedCallback () {
    const id = '___gcse_0';
    const CX = this.getAttribute('cx'); // || '001222343498871500969:-u73i2qfu2s';
    const label = this.getAttribute('label') || 'Search';

    // const SEARCH_ELEM = document.querySelector('my-search');

    const elem = document.createElement('div');
    const labelElem = document.createElement('label');

    elem.classList.add('gcse-search');
    elem.setAttribute('data-mobileLayout', 'true');

    labelElem.textContent = label;
    labelElem.setAttribute('for', 'gsc-i-id1');

    this.after(elem);
    this.after(labelElem);

    this.attachShadow({ mode: 'open' }).appendChild(this._script(CX));

    this.$$ = { CX, id, label, elem, labelElem };

    console.debug('my-search:', this.$$, this);
  }

  _script (cx) {
    const GCSE = document.createElement('script');
    // GCSE.type = 'text/javascript';
    GCSE.async = true;
    GCSE.src = 'https://cse.google.com/cse.js?cx=' + cx;

    // var s = document.getElementsByTagName('script')[0];
    // s.parentNode.insertBefore(gcse, s);

    return GCSE;
  }
}

MySearchElement.define();

// Was: customElements.define('my-foobar', MyFoobarElement);
