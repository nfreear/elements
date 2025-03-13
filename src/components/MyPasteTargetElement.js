/**
 * My Paste Target -
 * Its aim is to make it easier to paste content from the clipboard into a
 * group of input fields, in a more accessible way.
 * It may help with WCAG 2.2 Success Criteria 3.3.8 Accessible Authentication.
 *
 * @copyright © Nick Freear, 01-Nov-2023.
 *
 * @see https://codepen.io/nfreear/pen/jOXJjgW
 * @see https://codepen.io/nfreear/pen/wvNgeNd (Original)
 * @see https://w3.org/TR/WCAG22/#accessible-authentication-minimum
 * @see https://w3.org/WAI/WCAG22/Techniques/failures/F109
 */

const { HTMLElement } = window || globalThis;

/**
 * @class    MyPasteTargetElement
 * @property {number} length   - Required attribute. The expected length of pasted data.
 * @property {string} selector - Optional. CSS selector (Default: 'input')
 * @property {string} value    - The `value` is set on a paste event.
 * @event             paste    - Listens for the `paste` event.
 */
export class MyPasteTargetElement extends HTMLElement {
  static getTag () {
    return 'my-paste-target';
  }

  get length () { return parseInt(this.getAttribute('length')); }

  get selector () { return this.getAttribute('selector') || 'input'; }

  set value (val) { this._setValue(val); }

  get value () { return this._value; }

  connectedCallback () {
    this._inputs = this.querySelectorAll(this.selector);
    if (!this._inputs.length) {
      throw new Error('No <input> elements found.');
    }
    if (!this.length) {
      throw new Error('Attribute `length` is required and numeric.');
    }
    this._checkCharsPerField();

    this.addEventListener('paste', (ev) => this._handlePasteEvent(ev));

    console.debug('my-paste-target:', this);
  }

  _setValue (value) {
    if (!this._isValid(value)) {
      return false;
    }
    const PER = this._checkCharsPerField();
    const PARTS = this._equalSplit(value, PER);

    PARTS.forEach((part, idx) => {
      this._inputs[idx].value = part;
    });
    /* this._inputs.forEach((input, idx) => {
      input.value = PARTS[idx];
    }); */

    this._value = value;
    this.setAttribute('value', value);

    return PARTS;
  }

  _handlePasteEvent (ev) {
    const DATA = ev.clipboardData.getData('text');

    const PARTS = this._setValue(DATA);

    if (PARTS) {
      ev.preventDefault();
    }
    console.debug('Paste:', DATA.length, PARTS, ev);
  }

  /** @TODO validate format!
   */
  _isValid (value) {
    if (value.length > this.length) {
      return this._error(`Pasted value is too long: ${value.length}`);
    }
    if (value.length < this.length) {
      return this._error(`Pasted value is too short: ${value.length}`);
    }
    return true;
  }

  _checkCharsPerField () {
    const PER = this.length / this._inputs.length;
    if (parseInt(PER) !== PER) {
      throw new Error(`Characters per field must be an integer: ${PER}`);
    }
    return PER;
  }

  _error (message) {
    console.warn('Error:', message);
    this._inputs[0].setCustomValidity(message);
    this._inputs[0].reportValidity();
    return false;
  }

  /**
   * @see https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript,
   */
  _equalSplit (inputData, size) {
    size = parseInt(size);
    return inputData.match(new RegExp(`.{1,${size}}`, 'g'));
  }
}

// Was: customElements.define(MyPasteTargetElement.getTag(), MyPasteTargetElement);
