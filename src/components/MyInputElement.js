/**
 * Copy useful attributes/properties from "this" to the enclosed `input` element.
 *
 * @example <my-input type="email"> <input type="text"> </my-input>
 * @copyright © Nick Freear, 10-Mar-2025.
 * @see https://github.com/nfreear/elements
 * @status beta
 * @since 1.7.0
 */
const { HTMLElement } = window;

export class MyInputElement extends HTMLElement {
  static getTag () {
    return 'my-input-element';
  }

  get _cssSelector () {
    return 'input, select';
  }

  get _attributes () {
    return [
      'autocomplete',
      'maxlength',
      'minlength',
      'pattern',
      'required',
      'role', // ARIA
      'type'
    ];
  }

  connectedCallback () {
    this._inputElement = this.querySelector(this._cssSelector);
    console.assert(this._inputElement, 'An <input> or <select> element is required');

    const FOUND = this._attributes.map((attr) => {
      const value = this.getAttribute(attr);
      if (value) {
        this._inputElement.setAttribute(attr, value);
      }
      return { attr, value };
    });

    const ARIA = this._transferDataAriaAttributes();

    console.debug('my-input:', FOUND, ARIA, this);
  }

  // ARIA: https://www.w3.org/TR/wai-aria-1.2/#aria-attributes
  get _dataAriaRegex () { return /^data-(aria-[a-z]{4,17})$/; }

  _transferDataAriaAttributes () {
    const ARIA = [...this.attributes].map(({ name, value }) => {
      const match = name.match(this._dataAriaRegex);
      if (match) {
        const attr = match[1];
        this._inputElement.setAttribute(attr, value);
        return { attr, value };
      }
      return null;
    });
    return ARIA.filter(el => el);
  }
}
