/**
 * Custom site search.
 *
 * @copyright © Nick Freear, 17-Mar-2022.
 *
 * @see ../demo/my-search.html
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

    const elem = document.createElement('div');
    const labelElem = document.createElement('label');

    elem.classList.add('gcse-search');
    elem.setAttribute('data-mobileLayout', 'true');

    labelElem.textContent = label;
    labelElem.setAttribute('for', 'gsc-i-id1');

    this.after(elem);
    this.after(labelElem);

    this._addConfig();

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

  _addConfig () {
    window.__gcse = {
      parsetags: 'onload', // Not: 'explicit', // Defaults to 'onload'
      initializationCallback: R => console.debug('CSE init:', R),
      searchCallbacks: {
        image: {
          /* starting: myImageSearchStartingCallback,
          ready: myImageResultsReadyCallback,
          rendered: myImageResultsRenderedCallback, */
        },
        web: {
          starting: (N, q) => console.debug('CSE start:', N, q),
          ready: R => console.debug('CSE ready:', R),
          rendered: R => console.debug('CSE rendered:', R)
        }
      }
    };
  }
}

// Was: MySearchElement.define();
// Was: customElements.define('my-foobar', MyFoobarElement);
