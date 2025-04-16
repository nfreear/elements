import MyMinElement from '../MyMinElement.js';

/**
 * Filter a collection of elements, based on the value of a search input field.
 *
 * @customElement element-filter
 * @demo https://nfreear.github.io/elements/demo/my-element-filter.html
 */
export class MyElementFilterElement extends MyMinElement {
  /*
    Public API.
  */
  /** @return {string} */
  static getTag () {
    return 'my-element-filter';
  }

  get _template () {
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
    return this._searchField.value;
  }

  set value (data) {
    this._inputEventHandler(this._mockEvent(data));
    this._searchField.value = data;
  }

  /** Life cycle callbacks.
   * @return {void}
   */
  connectedCallback () {
    this._attachLocalTemplate(this._template); // TEMPLATE);

    const labelElement = this.shadowRoot.querySelector('label');

    labelElement.textContent = this.label;
    this._searchField.setAttribute('autocomplete', this.autocomplete);

    this._searchField.addEventListener('input', (ev) => this._inputEventHandler(ev));

    console.debug('my-element-filter:', [this]);
  }

  /*
    Private helpers.
  */

  /** @return {HTMLInputElement} */
  get _searchField () { return this.shadowRoot.querySelector('#search'); }

  get elements () { return this._privElements || []; }

  _loadElements () {
    if (!this._privElements) {
      this._privElements = this.querySelectorAll(this.selector);
    }
    if (!this._privElements) {
      throw new Error(`No elements found with selector: ${this.selector}`);
    }
  }

  _inputEventHandler (ev) {
    // Late initialization - allow other (custom element) JS to run first!
    this._loadElements();

    const QUERY = ev.target.value.trim().toLowerCase();
    let count = 0;

    if (QUERY.length >= this.minlength) {
      this.elements.forEach((el) => {
        const TEXT = el.textContent.toLowerCase();
        const FOUND = TEXT.includes(QUERY);

        el.dataset.myElementFilter = FOUND ? 'in' : 'out';
        count += FOUND ? 1 : 0;
      });
    } else {
      this.elements.forEach((el) => {
        el.removeAttribute('data-my-element-filter');
      });
    }

    this.setAttribute('value', QUERY);
    this.setAttribute('count', count);
    this.setAttribute('total', this.elements.length);

    this._setOutput(count);

    console.debug('input:', count, QUERY, ev);
  }

  _mockEvent (value) { return { mockEvent: true, target: { value } }; }

  _setOutput (count) {
    const outputElement = this.shadowRoot.querySelector('output');
    outputElement.value = this.outputTemplate.replace('%d', count);
  }
}

export default MyElementFilterElement;
