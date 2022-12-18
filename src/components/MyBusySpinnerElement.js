/**
 * A Busy Spinner animation - pure CSS.
 *
 * @copyright © Nick Freear, 2021-10-26.
 *
 * @see https://gist.github.com/nfreear/ae83b11a7572cd3122a181bb6ebb7fff,
 * @see https://gist.github.com/nfreear/a71bfce05ef9bae03011ea33762c9d69,
 * @see https://sap.github.io/ui5-webcomponents/playground/components/BusyIndicator/,
 * @see https://github.com/SAP/ui5-webcomponents/blob/master/packages/main/src/BusyIndicator.hbs,
*/

import { MyElement } from '../MyElement.js';

const TEMPLATE = `
<template>
  <style>
    @keyframes Rotate {
      0%   { transform: rotateZ(0deg); }
      100% { transform: rotateZ(360deg); }
    }
    :host {
      X-cursor: wait;
    }
    .css-spinner {
      border-color: rgba(127,127,127, 0.5);
      border-bottom-color: rgba(0,0,0, 0.75);
      border-style: solid;
      border-width: 3vh;
      border-radius: 50%;
      margin: 2rem auto;
      height: 40vh;
      width:  40vh;
      animation-direction: normal;
      animation-duration: 1.5s;
      animation-iteration-count: infinite;
      animation-timing-function: linear; /* << +1 ! */
      animation-play-state: running;
      animation-name: Rotate; /* Was: 'SpinnerZ' */
    }
    [ part = text ] {
      font-size: large;
      text-align: center;
    }
  </style>
  <div part="spinner" class="css-spinner" role="img" aria-label="Loading"></div>
  <p part="text" role="status" aria-live="polite"></p>
  <div class="slot" hidden><slot> Loading … </slot></div>
</template>
`;

export class MyBusySpinnerElement extends MyElement {
  static getTag () {
    return 'my-busy-spinner';
  }

  static get observedAttributes () {
    return ['hidden'];
  }

  attributeChangedCallback (name, oldValue, newValue) {
    const VALUE = newValue !== null;

    console.debug(`my-busy-spinner ~ ${name}: ${VALUE} ('${oldValue}', '${newValue}')`);
  }

  async connectedCallback () {
    // const name = this.getAttribute('name') || 'A name attribute';

    await this._attachLocalTemplate(TEMPLATE);
    /** @WAS await this.getTemplate('my-busy-spinner'); */

    const TEXT = this.textContent.trim() || 'Loading …'; // .shadowRoot.querySelector('.slot').textContent;
    const statusElem = this.shadowRoot.querySelector('[ role = status ]');

    setTimeout(() => { statusElem.textContent = TEXT; }, 100);

    console.debug('my-busy-spinner:', TEXT, this);
  }
}

MyBusySpinnerElement.define();
