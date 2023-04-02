/**
 * Easily store an form field value to `localStorage`.
 * Also supports `sessionStorage`.
 *
 * @copyright © Nick Freear, 24-Jan-2023.
 * @see https://codepen.io/nfreear/pen/OJoRbqa
 * @status experimental
 * @since 1.6.0
 */

import { MyElement } from '../MyElement.js';

export class MyLocalStorageElement extends MyElement {
  static getTag () {
    return 'my-local-storage';
  }

  get storage () {
    return window[this.storeTo];
  }

  get storeTo () {
    const isSession = this.getAttribute('session') === 'true';
    return `${isSession ? 'session' : 'local'}Storage`;
  }

  get value () {
    return this.storage.getItem(`${this.key}.value`);
  }

  set value (val) {
    console.debug();
    this.storage.setItem(`${this.key}.value`, val);
    this.storage.setItem(`${this.key}.date`, new Date().toISOString());
  }

  get key () {
    return this.getAttribute('key');
  }

  async connectedCallback () {
    if (!this.getAttribute('key')) {
      throw new Error("Attribute 'key' is required.");
    }

    const selector = this.getAttribute('selector');
    if (!selector) {
      throw new Error("Attribute 'selector' is required.");
    }

    // For now, just one element!
    const elem = document.querySelector(selector);
    if (!elem) {
      throw new Error('No linked element selected.');
    }

    const value = this.value;
    const storeTo = this.storeTo;
    const storage = this.storage;
    const $$ = { selector, value, storeTo, elem, storage };

    this.setTargetValue(elem, value);

    /* elem.addEventListener('change', ev => {
      const VALUE = this.getTargetValue(ev.target);
      this.value = VALUE;
      console.debug('Change event - stored value:', VALUE, ev);
    }); */

    elem.addEventListener('input', ev => {
      const VALUE = this.getTargetValue(ev.target);
      this.value = VALUE;
      console.debug('Input event - stored value:', VALUE, ev);
    });

    console.debug('my-local-storage:', $$, this);
  }

  getTargetValue (target) {
    let value;
    if (target.type === 'checkbox') {
      value = target.checked ? target.value : 'false';
    } else if (this._hasValue(target)) {
      value = target.value;
    }
    return value;
  }

  setTargetValue (target, value) {
    if (target.type === 'checkbox') {
      target.checked = (value !== 'false');
    } else if (this._hasValue(target)) {
      target.value = value;
      // return;
    }
  }

  _hasValue (target) {
    const OK = /(INPUT|SELECT|TEXTAREA)/.test(target.tagName);
    if (!OK) {
      throw new Error(`Target element not supported: ${target.tagName}`);
    }
    return OK;
  }
}

MyLocalStorageElement.define();
