/**
 * Filter a collection of elements, based on the value of a search input field.
 *
 * @copyright © Nick Freear, 09-Mar-2025.
 *
 * @see https://codepen.io/nfreear/pen/LEYjYEK
 * @status beta
 * @since 1.7.0
 */

import { MyElement } from '../MyElement.js';

const MIN_SIZE = 1;
const TEMPLATE = `
<template>
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

export class MyElementFilterElement extends MyElement {
  /*
    Public API.
  */
  static getTag () {
    return 'my-element-filter';
  }

  get selector () {
    const selector = this.getAttribute('selector');
    if (!selector) {
      throw new Error('"selector" is a required attribute (CSS selector syntax).');
    }
    return selector;
  }

  get label () {
    return this.getAttribute('label') || 'Filter';
  }

  get autocomplete () {
    return this.getAttribute('autocomplete');
  }

  get minlength () {
    return this.getAttribute('minlength') || MIN_SIZE;
  }

  get outputTemplate () {
    return this.getAttribute('output-template') || '%d results';
  }

  get value () {
    return this._searchField.value;
  }

  set value (data) {
    this._inputEventHandler(this._mockEvent(data));
    this._searchField.value = data;
  }

  /*
    Life cycle callbacks.
  */
  connectedCallback () {
    this._attachLocalTemplate(TEMPLATE);

    const labelElement = this.shadowRoot.querySelector('label');

    labelElement.textContent = this.label;
    this._searchField.setAttribute('autocomplete', this.autocomplete);

    this._searchField.addEventListener('input', (ev) => this._inputEventHandler(ev));

    console.debug('my-element-filter:', [this]);
  }

  /*
    Private helpers.
  */
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

        // el.hidden = !FOUND;
        el.dataset.myElementFilter = FOUND ? 'in' : 'out';
        count += FOUND ? 1 : 0;
      });
    } else {
      this.elements.forEach((el) => {
        el.removeAttribute('data-my-element-filter');
        // el.dataset.myElementFilter = '';
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

MyElementFilterElement.define();
