const { HTMLElement } = window;

/**
 * Copy useful attributes/properties from "this" to the enclosed `input` element.
 *
 * @copyright © Nick Freear, 10-Mar-2025.
 *
 * @customElement my-input
 * @demo https://nfreear.github.io/elements/demo/my-element-filter.html
 * @see https://github.com/nfreear/elements
 * @status beta, an-form
 * @since 1.7.0
 */
export class MyInputElement extends HTMLElement {
  static getTag () {
    return 'my-input-element';
  }

  get #cssSelector () {
    return 'input, select, textarea';
  }

  get #_attributes () {
    return [
      'autocomplete',
      'maxlength',
      'minlength',
      'pattern',
      'required',
      'type'
    ];
  }

  connectedCallback () {
    console.assert(this.#inputElement, 'An <input>, <select> or <textarea> element is required');

    const FOUND = this.#_attributes.map((attr) => {
      const value = this.getAttribute(attr);
      if (value) {
        this.#inputElement.setAttribute(attr, value);
      }
      return { attr, value };
    });

    const ARIA = this.#transferDataAriaAttributes();

    console.debug('my-input:', FOUND, ARIA, this);
  }

  get #inputElement () { return this.querySelector(this.#cssSelector); }

  // ARIA: https://www.w3.org/TR/wai-aria-1.2/#aria-attributes
  get #dataAriaRegex () { return /^data-(role|aria-[a-z]{4,17})$/; }

  #transferDataAriaAttributes () {
    const ARIA = [...this.attributes].map(({ name, value }) => {
      const match = name.match(this.#dataAriaRegex);
      if (match) {
        const attr = match[1];
        this.#inputElement.setAttribute(attr, value);
        return { attr, value };
      }
      return null;
    });
    return ARIA.filter(el => el);
  }
}
