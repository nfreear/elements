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
  </span>
  <slot></slot>
</template>
`;

export class MyElementFilterElement extends MyElement {
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

  get minlength () {
    return this.getAttribute('minlength') || MIN_SIZE;
  }

  connectedCallback () {
    this.elements = null;

    this._attachLocalTemplate(TEMPLATE);

    const searchField = this.shadowRoot.querySelector('#search');
    const labelElement = this.shadowRoot.querySelector('label');

    labelElement.textContent = this.label;

    searchField.addEventListener('input', (ev) => this._inputEventHandler(ev));

    console.debug('my-element-filter:', this.elements.length, this);
  }

  _getElements () {
    if (!this.elements) {
      this.elements = this.querySelectorAll(this.selector);
    }
    if (!this.elements) {
      throw new Error(`No elements found with selector: ${this.selector}`);
    }
  }

  _inputEventHandler (ev) {
    // Late initialization - allow other (custom element) JS to run first!
    this._getElements();

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

    console.debug('input:', count, QUERY, ev);
  }
}

MyElementFilterElement.define();
