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

// const { customElements, HTMLElement } = window;

const MIN_SIZE = 2;
const TEMPLATE = `
<template>
  <label part="label" for="search">Filter</label>
  <input part="input" id="search" type="search">
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

  connectedCallback () {
    this.elements = this.querySelectorAll(this.selector);

    if (!this.elements) {
      throw new Error(`No elements found with selector: ${this.selector}`);
    }

    this._attachLocalTemplate(TEMPLATE);

    const searchField = this.shadowRoot.querySelector('#search');

    searchField.addEventListener('input', (ev) => this._inputEventHandler(ev));

    console.debug('my-element-filter:', this.elements.length, this);
  }

  _inputEventHandler (ev) {
    const QUERY = ev.target.value.trim().toLowerCase();
    let count = 0;

    if (QUERY.length >= MIN_SIZE) {
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

    console.debug('input:', count, QUERY, ev);
  }
}

MyElementFilterElement.define();
