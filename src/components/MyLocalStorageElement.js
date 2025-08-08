const { HTMLElement } = window;

/**
 * Easily store a form field value to `localStorage`.
 * Also supports `sessionStorage`.
 *
 * @copyright © Nick Freear, 24-Jan-2023.
 * @customElement my-local-storage
 * @demo https://codepen.io/nfreear/pen/OJoRbqa
 * @status experimental
 * @since 1.6.0
 */
export class MyLocalStorageElement extends HTMLElement {
  static getTag () { return 'my-local-storage'; }

  get _eventName () { return 'input'; }

  get selector () {
    const _selector = this.getAttribute('selector');
    console.assert(_selector, '"selector" (CSS selector) - Attribute required.');
    return _selector;
  }

  get key () {
    const _key = this.getAttribute('key');
    console.assert(_key, '"key" (Storage key) - Attribute required.');
    return _key;
  }

  get storage () { return window[this._storeTo]; }

  get _storeTo () {
    const isSession = this.getAttribute('session') === 'true';
    return `${isSession ? 'session' : 'local'}Storage`;
  }

  get value () { return this.storage.getItem(`${this.key}.value`); }

  set value (val) {
    this.storage.setItem(`${this.key}.value`, val);
    this.storage.setItem(`${this.key}.date`, new Date().toISOString());
  }

  get _element () {
    const elem = document.querySelector(this.selector);
    console.assert(elem, `Target element not found: ${this.selector}`);
    return elem;
  }

  connectedCallback () {
    if (!this.key || !this.selector) {
      throw new Error('Missing required attribute(s)');
    }

    // For now, just one element!
    if (!this._element) {
      throw new Error('Element not found.');
    }

    this._elementValue = this.value;

    /* elem.addEventListener('change', ev => { }); */

    this._element.addEventListener(this._eventName, (ev) => this._onInputEvent(ev));

    console.debug('my-local-storage:', [this]);
  }

  _onInputEvent (ev) {
    this.store();
    console.debug('Input event - stored value:', this.value, ev);
  }

  store () {
    this.value = this._elementValue;
    return this.value;
  }

  get _elementValue () {
    const target = this._element;
    let value;
    if (target.type === 'checkbox') {
      value = target.checked ? target.value : 'false';
    } else if (this._hasValue(target)) {
      value = target.value;
    }
    return value;
  }

  set _elementValue (value) {
    const target = this._element;
    if (target.type === 'checkbox') {
      target.checked = (value !== 'false');
    } else if (this._hasValue(target)) {
      target.value = value;
      // return;
    }
  }

  _hasValue (target) {
    const OK = /^(INPUT|SELECT|TEXTAREA)/.test(target.tagName);
    const INPUT_ISH = target.type && typeof target.value !== 'undefined'; // formAssociated.
    if (!OK && !INPUT_ISH) {
      throw new Error(`Target element not supported: ${target.tagName}`);
    }
    return OK || INPUT_ISH;
  }
}
