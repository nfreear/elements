const { HTMLElement, location, navigator } = window;

/**
 * Implements the Web Share API.
 * @date 01-June-2025 ??
 * @customElement my-sharing-widget
 * @demo https://codepen.io/nfreear/pen/azONmMo
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

  connectedCallback () {
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
    const formElem = document.createElement('form');
    const buttonElem = document.createElement('button');
    const outputElem = document.createElement('output');
    buttonElem.textContent = this.buttonLabel;
    buttonElem.setAttribute('part', 'button');
    outputElem.id = 'output';
    outputElem.setAttribute('part', 'output');
    formElem.setAttribute('part', 'form');
    formElem.appendChild(buttonElem);
    formElem.appendChild(outputElem);
    return formElem;
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
