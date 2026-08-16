const { HTMLElement, location, navigator } = window;

/**
 * Implements the Web Share API.
 * @date 01-June-2025 ??
 * @customElement my-sharing-widget
 * @demo https://codepen.io/nfreear/pen/azONmMo
 * @see https://caniuse.com/web-share
 */
export class MySharingWidgetElement extends HTMLElement {
  static getTag () { return 'my-sharing-widget'; }

  get descSelector () {
    return this.getAttribute('desc-selector') || 'meta[ name = description ]';
  }

  get urlSelector () {
    return this.getAttribute('url-selector') || 'link[ rel = canonical ]';
  }

  get buttonLabel () {
    return this.getAttribute('button-label') || 'Share';
  }

  get cancelMessage () {
    return this.getAttribute('cancel-message') || 'Share was cancelled.';
  }

  get #descElement () {
    const ELEM = document.querySelector(this.descSelector);
    console.assert(ELEM, 'Description <meta> element not found');
    return ELEM;
  }

  get #linkElement () {
    return document.querySelector(this.urlSelector);
  }

  constructor () {
  // Was: connectedCallback () {
    super();
    if (!this.#supportsShareApi) {
      console.warn('Web Share API not supported');
      return;
    }
    const formElem = this.#createElements();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(formElem);

    formElem.addEventListener('submit', (ev) => this.#onSubmitEvent(ev));

    console.debug('my-sharing-widget', [this]);
  }

  async #onSubmitEvent (ev) {
    ev.preventDefault();
    console.debug('Share:', this.#shareData, this.#formElements, ev);
    try {
      await navigator.share(this.#shareData);
      this.#formElements.output.value = 'Shared successfully';
      this.dataset.shared = true;
    } catch (err) {
      if (err.name === 'AbortError') {
        this.#formElements.output.value = this.cancelMessage;
      } else {
        this.#formElements.output.value = `Error: ${err}`;
      }
      this.dataset.shared = false;
      this.dataset.error = err;
      console.error('Error:', err);
      console.dir(err);
    }
  }

  #createElements () {
    const svgElem = this.#createSVGIcon();
    const formElem = document.createElement('form');
    const buttonElem = document.createElement('button');
    const outputElem = document.createElement('output');
    const spanElem = document.createElement('span');
    spanElem.textContent = this.buttonLabel;
    spanElem.setAttribute('part', 'span');
    buttonElem.appendChild(svgElem);
    buttonElem.appendChild(spanElem);
    buttonElem.setAttribute('part', 'button');
    buttonElem.setAttribute('aria-describedby', 'output');
    outputElem.id = 'output';
    outputElem.setAttribute('part', 'output');
    formElem.setAttribute('part', 'form');
    formElem.appendChild(buttonElem);
    formElem.appendChild(outputElem);
    return formElem;
  }

  /*
  https://fonts.google.com/icons?selected=Material+Symbols+Outlined:share:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=share&icon.size=24&icon.color=%23e3e3e3
  */
  #createSVGIcon () {
    const svgNS = 'http://www.w3.org/2000/svg';
    const d = `M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50
  35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24
  0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17
  0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17
  0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm508.5-291.5Q720-743 720-760t-11.5-28.5Q697-800 680-800t-28.5 11.5Q640-777 640-760t11.5 28.5Q663-720  680-720t28.5-11.5ZM680-200ZM200-480Zm480-280Z`;
    const svg = document.createElementNS(svgNS, 'svg');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('viewBox', '0 -960 960 960');
    svg.setAttribute('height', '24px');
    svg.setAttribute('width', '24px');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('part', 'svg icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.appendChild(path);
    return svg;
  }

  get #formElements () { return this.shadowRoot.querySelector('form').elements; }

  get #shareData () {
    return {
      title: document.title,
      text: this.#descElement ? this.#descElement.getAttribute('content') : null,
      url: this.#linkElement ? this.#linkElement.href : location.href
    };
  }

  get #supportsShareApi () {
    return typeof navigator.share === 'function'; // && navigator.canShare;
  }
}

export default MySharingWidgetElement;
