/**
 * Global Accessibility Awareness Day (GAAD) - banner/widget.
 *
 * gaad-widget.js | © 2019 Nick Freear | License: MIT.
 *
 * @see https://github.com/nfreear/gaad-widget
 * @copyright © Nick Freear, 05-May-2022.
 *
 * @TODO ~ Replace hard-coded date-text!
 */

import { MyElement } from '../MyElement.js';

const { location } = window;

export class MyGaadWidgetElement extends MyElement {
  static getTag () {
    return 'my-gaad-widget';
  }

  async connectedCallback () {
    // const name = this.getAttribute('name') || 'A name attribute';

    if (this._shouldShow()) {
      await this.getTemplate('my-gaad-widget');
    }

    console.debug('my-gaad-widget:', this._shouldShow(), this);
  }

  _shouldShow () {
    // Simple test for the month of May!
    const IS_MAY = new Date().getMonth() === 4;
    const FORCE = /gaad=force/.test(location.search);

    return IS_MAY || FORCE;
  }
}

MyGaadWidgetElement.define();
