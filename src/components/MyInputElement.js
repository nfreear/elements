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
      'pattern',
      'type'
    ];
  }

  async connectedCallback () {
    this._inputElement = this.querySelector(this._cssSelector);

    const FOUND = this._attributes.map((attr) => {
      const value = this.getAttribute(attr);
      if (value) {
        this._inputElement.setAttribute(attr, value);
      }
      return { attr, value };
    });

    console.debug('my-input:', FOUND, this);
  }
}

// Was: customElements.define('my-input', MyInputElement);
