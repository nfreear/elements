/**
 * A Global Accessibility Awareness Day banner.
 *
 * @copyright gaad-widget.js | © 2019 Nick Freear | License: MIT.
 *
 * @see https://github.com/nfreear/gaad-widget
 * @copyright © Nick Freear, 05-May-2022.
 *
 * @TODO ~ Monitor hard-coded date-text in template!
 */

import { MyElement } from '../MyElement.js';

const { location } = window;

export class MyGaadWidgetElement extends MyElement {
  static getTag () {
    return 'my-gaad-widget';
  }

  async connectedCallback () {
    const YEAR = new Date().getFullYear();

    if (this._shouldShow()) {
      await this.getTemplate('my-gaad-widget');

      this._setDataYear(YEAR);
    }

    console.debug('my-gaad-widget:', YEAR, this._shouldShow(), this);
  }

  _shouldShow () {
    // Simple test for the month of May!
    const IS_MAY = new Date().getMonth() === 4;
    const FORCE = /gaad=force/.test(location.search);

    return IS_MAY || FORCE;
  }

  _setDataYear (year) {
    // const YEAR = new Date().getFullYear();
    const WRAP = this.shadowRoot.querySelector('.gaad-widget-js');

    WRAP.setAttribute('data-year', year);
  }
}
