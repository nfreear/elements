/**
 * My Paste Target.
 *
 * @copyright © Nick Freear, 01-Nov-2023.
 *
 * @see https://codepen.io/nfreear/pen/jOXJjgW
 * @see https://w3.org/TR/WCAG22/#accessible-authentication-minimum
 * @see https://w3.org/WAI/WCAG22/Techniques/failures/F109
 * @status
 * @since
 */

const { customElements, HTMLElement } = window || globalThis;

/**
 * @class    MyPasteTargetElement
 * @property {number} length   - Required. The expected length of pasted data.
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
    // const PER = this.length / this._inputs.length;
    // TODO: Check for an integer value!

    this.addEventListener('paste', (ev) => this._handlePasteEvent(ev));

    console.debug('my-paste-target:', this);
  }

  _setValue (value) {
    /* TODO: validate length, format, etc.!! */
    const PER = this.length / this._inputs.length;
    const PARTS = this._equalSplit(value, PER);

    PARTS.forEach((part, idx) => {
      this._inputs[idx].value = part;
    });

    this._value = value;
    this.setAttribute('value', value);

    return PARTS;
  }

  _handlePasteEvent (ev) {
    const DATA = ev.clipboardData.getData('text');
    // TODO: validate length, format, etc.!!

    const PARTS = this._setValue(DATA);

    console.debug('Paste:', PARTS, ev);

    // INPUTS[0].setCustomValidity('Invalid');
    // INPUTS[0].reportValidity();

    ev.preventDefault();
  }

  /**
   * @see https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript,
   */
  _equalSplit (inputData, size) {
    size = parseInt(size);
    return inputData.match(new RegExp(`.{1,${size}}`, 'g'));
  }
}

customElements.define('my-paste-target', MyPasteTargetElement);

// End.
