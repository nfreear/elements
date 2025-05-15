/**
 * Display a "Not production ready" warning.
 *
 * @copyright © Nick Freear, 12-Nov-2023.
 * @customElement my-dev-warning
 * @status beta
 * @since 1.7.0
 */
import MyMinElement from '../MyMinElement.js';

export class MyDevWarningElement extends MyMinElement {
  static getTag () {
    return 'my-dev-warning';
  }

  get template () {
    return `
<template>
<style>
details {
  background: #fff6f3; /* Was: #ffcc99; #ffefe7; */
  color: #b35100; /* Alloy Orange #c46210 */
  font-family: serif;
  max-width: 32rem;
}
details > * {
  border: 1px solid currentColor;
  border-radius: .25rem;
  padding: .5rem;
}
details > div {
  border-top: 0;
  padding: .5rem .5rem 0;
}
p { margin: 0 0 .9rem; }
by { float: right; }
icon::after {
  content: '⚠️';
  float: left;
  font-size: 2rem;
  margin-right: .3rem;
  X-vertical-align: top;
}
</style>
<details part="details">
  <summary>Not production ready!</summary>
  <div>
    <p><icon part="icon"></icon>The code in this example is not intended for production environments. It needs testing!</p>
    <p>
      <l>License: <a href="https://github.com/nfreear/elements/blob/main/LICENSE.txt" target="_top">MIT</a>.</l>
      <by>Powered by <a href="https://github.com/nfreear/elements" target="_top">My Elements</a>.</by>
    </p>
  </div>
</details>
</template>`;
  }

  async connectedCallback () {
    this._attachLocalTemplate(this.template);
    console.warn('my-dev-warning:', 'Not Production Ready!', this);
  }
}
