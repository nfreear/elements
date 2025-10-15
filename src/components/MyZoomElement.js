import attachTemplate from '../util/attachTemplate.js';

/**
 *
 * @customElement my-zoom
 * @copyright © Nick Freear, 15-Oct-2025.
 * @see https://codepen.io/nfreear/pen/QwypxjP
 */
export class MyZoomElement extends HTMLElement {
  static getTag () { return 'my-zoom'; }

  get value () { return parseInt(this.#rangeElem.value); }

  get #thresholdA () { return parseInt(this.getAttribute('threshold-a')) || 129; }
  get #thresholdB () { return parseInt(this.getAttribute('threshold-b')) || 149; }

  get #initial () { return parseInt(this.getAttribute('initial')) || 100; }
  get #max () { return parseInt(this.getAttribute('max')) || 240; }
  get #min () { return parseInt(this.getAttribute('min')) || 80; }
  get #step () { return parseInt(this.getAttribute('step')) || 20; }

  get #htmlTemplate () {
    return `
  <template>
    <fieldset id="zoomFS" part="fieldset">
      <label id="labelID">
        Zoom
        <input name="range" part="range input" type="range" min="${this.#min}" max="${this.#max}" step="${this.#step}" value="${this.#initial}">
        <output name="output" part="output" X_aria-labelledby="labelID"></output>
      </label>
    </fieldset>
    <span part="slot">
      <slot></slot>
    </span>
  </template>
  `;
  }

  get #fieldset () { return this.shadowRoot.querySelector('fieldset'); }
  get #outputElem () { return this.#fieldset.elements.output; }
  get #rangeElem () { return this.#fieldset.elements.range; }
  get #rootElem () { return document.documentElement; }

  connectedCallback () {
    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);

    this.#fieldset.addEventListener('change', (ev) => this.#changeEventHandler(ev));

    console.debug('my-zoom:', [this]);
  }

  #changeEventHandler (ev) {
    // Was: const value = parseInt(ev.target.value);
    const aboveThresholdA = this.value > this.#thresholdA;
    const aboveThresholdB = this.value > this.#thresholdB;

    this.#rootElem.style.setProperty('--my-zoom', `${this.value}%`);
    // Was: this.#rootElem.style.zoom = `${value}%`;
    this.#rootElem.dataset.myZoom = this.value;
    this.#rootElem.dataset.zoomAboveThresholdA = aboveThresholdA;
    this.#rootElem.dataset.zoomAboveThresholdB = aboveThresholdB;

    this.#outputElem.value = `${this.value}%`;

    console.debug('Zoom:', aboveThresholdA, this.value, ev);
  }
}

export default MyZoomElement;
