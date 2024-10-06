/**
 * An "Open in CodePen" button.
 *
 * @copyright © Nick Freear.
 * @since 06-Oct-2024.
 */

import MyElement from '../MyElement.js';

const TEMPLATE = `
<template>
<style>
  button { font-size: inherit; padding: .5rem 1rem; }
  [ part = slot ] {
    border: 1px solid gray;
    border-radius: .2rem;
    margin: 1rem 0;
    padding: .5rem;
  }
</style>
<form action="https://codepen.io/pen/define" method="POST" target="_blank">
  <input id="codepen-data-ex-0" type="hidden" name="data" value='{}'>
  <button part="button">Open in CodePen</button>
</form>
<div part="slot">
  <slot></slot>
</div>
</template>
`;

const PEN_TEMPLATE = {
  title: '',
  html: 'Hello!',
  css: '',
  js: "console.log('Hello!');",
  head: '',
  css_external: '',
  js_external: ''
};

export class MyCodepenButtonElement extends MyElement {
  static getTag () {
    return 'my-codepen-button';
  }

  get template () { return TEMPLATE; }
  get penData () { return PEN_TEMPLATE; }
  get inputElement () { return this.shadowRoot.querySelector('input[name = data]'); }

  get _import () {
    return this.getAttribute('import');
  }

  async connectedCallback () {
    this._attachLocalTemplate(this.template);

    this._NoScriptAllowed();
    this._processStylesheet();
    this._processImportAttribute();

    this.penData.html = this.innerHTML.toString();

    this.inputElement.value = JSON.stringify(this.penData);

    console.debug('my-codepen-button:', this.penData, this);
  }

  _NoScriptAllowed () {
    if (this.querySelector('script')) {
      throw new Error('Script not allowed!');
    }
  }

  _processStylesheet () {
    const styleElement = this.querySelector('style');
    if (styleElement) {
      this.penData.css = styleElement.textContent;
      this.removeChild(styleElement);
    }
  }

  _processImportAttribute () {
    if (this._import) {
      this.penData.js = `
import '${this._import}';
`;
    }
  }
}

MyCodepenButtonElement.define();
