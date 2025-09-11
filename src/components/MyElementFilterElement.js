import attachTemplate from '../util/attachTemplate.js';

/**
 * Filter a collection of elements, based on the value of a search input field.
 *
 * @customElement element-filter
 * @demo https://nfreear.github.io/elements/demo/my-element-filter.html
 */
export class MyElementFilterElement extends HTMLElement {
  #privElements;

  /*
    Public API.
  */
  /** @return {string} */
  static getTag () {
    return 'my-element-filter';
  }

  get #htmlTemplate () {
    return `<template>
  <span part="row">
    <label part="label" for="search"></label>
    <input part="input" id="search" type="search">
    <output part="output"></output>
  </span>
  <x-data part="slot">
    <slot></slot>
  </x-data>
</template>
`;
  }

  /** Attribute (required) - a CSS selector for the collection of elements to filter.
   * (Queried relative to `this` element - `this.querySelectorAll(this.selector)`.)
   * @return {string}
   */
  get selector () {
    const selector = this.getAttribute('selector');
    if (!selector) {
      throw new Error('"selector" is a required attribute (CSS selector syntax).');
    }
    return selector;
  }

  /** Attribute (optional)- text label for the filter input field.
   * @return {string}
   */
  get label () {
    return this.getAttribute('label') || 'Filter';
  }

  /** @return {string} */
  get autocomplete () {
    return this.getAttribute('autocomplete');
  }

  /** @return {number} */
  get minlength () {
    return parseInt(this.getAttribute('minlength') || 1); // MIN_SIZE
  }

  /** @return {string} */
  get outputTemplate () {
    return this.getAttribute('output-template') || '%d results';
  }

  /** Get/ set the value of the filter input field.
   * @return {string}
   */
  get value () {
    return this.#searchField.value;
  }

  set value (data) {
    this.#inputEventHandler(this._mockEvent(data));
    this.#searchField.value = data;
  }

  /** Life cycle callbacks.
   * @return {void}
   */
  connectedCallback () {
    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);

    this.#labelElement.textContent = this.label;
    this.#searchField.setAttribute('autocomplete', this.autocomplete);

    this.#searchField.addEventListener('input', (ev) => this.#inputEventHandler(ev));

    console.debug('my-element-filter:', [this]);
  }

  /*
    Private helpers.
  */

  /** @return {HTMLInputElement} */
  get #searchField () { return this.shadowRoot.querySelector('#search'); }
  get #labelElement () { return this.shadowRoot.querySelector('label'); }

  get elements () { return this.#privElements || []; }

  #lazyLoadElements () {
    if (!this.#privElements) {
      this.#privElements = this.querySelectorAll(this.selector);
    }
    if (!this.#privElements) {
      throw new Error(`No elements found with selector: ${this.selector}`);
    }
  }

  #inputEventHandler (ev) {
    // Late initialization - allow other (custom element) JS to run first!
    this.#lazyLoadElements();

    const QUERY = ev.target.value.trim().toLowerCase();

    const count = this.#filterElements(QUERY);

    this.setAttribute('value', QUERY);
    this.setAttribute('count', count);
    this.setAttribute('total', this.elements.length);

    this.#setOutput(count);

    console.debug('input:', count, QUERY, ev);
  }

  #filterElements (queryStr) {
    let count = 0;

    if (queryStr.length >= this.minlength) {
      this.elements.forEach((el) => {
        const TEXT = el.textContent.toLowerCase();
        const FOUND = TEXT.includes(queryStr);

        el.dataset.myElementFilter = FOUND ? 'in' : 'out';
        count += FOUND ? 1 : 0;
      });
    } else {
      this.elements.forEach((el) => {
        el.removeAttribute('data-my-element-filter');
      });
    }
    return count;
  }

  #mockEvent (value) { return { mockEvent: true, target: { value } }; }

  #setOutput (count) {
    const outputElement = this.shadowRoot.querySelector('output');
    outputElement.value = this.outputTemplate.replace('%d', count);
  }
}

export default MyElementFilterElement;
