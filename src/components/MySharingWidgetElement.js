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

  get descElement () {
    const ELEM = document.querySelector(this.descSelector);
    console.assert(ELEM, 'Description <meta> element not found');
    return ELEM;
  }

  get linkElement () {
    return document.querySelector(this.urlSelector);
  }

  connectedCallback () {
    if (!this._supportsShareApi) {
      console.warn('Web Share API not supported');
      return;
    }
    const formElem = this._createElements();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(formElem);

    formElem.addEventListener('submit', (ev) => this._onSubmitEvent(ev));

    console.debug('my-sharing-widget', this);
  }

  async _onSubmitEvent (ev) {
    ev.preventDefault();
    const shareForm = ev.target;
    console.debug('Share:', this._shareData, shareForm, ev);
    try {
      await navigator.share(this._shareData);
      shareForm.elements.output.value = 'Shared successfully';
      shareForm.dataset.shared = true;
    } catch (err) {
      shareForm.elements.output.value = `Error: ${err}`;
      shareForm.dataset.shared = false;
      console.error(`Error: ${err}`, err);
    }
  }

  _createElements () {
    const formElem = document.createElement('form');
    const buttonElem = document.createElement('button');
    const outputElem = document.createElement('output');
    buttonElem.textContent = this.buttonLabel;
    buttonElem.setAttribute('part', 'button');
    outputElem.id = 'output';
    outputElem.setAttribute('part', 'output');
    formElem.appendChild(buttonElem);
    formElem.appendChild(outputElem);
    return formElem;
  }

  get _shareData () {
    return {
      title: document.title,
      text: this.descElement ? this.descElement.getAttribute('content') : null,
      url: this.linkElement ? this.linkElement.href : location.href
    };
  }

  get _supportsShareApi () {
    return typeof navigator.share === 'function' && navigator.canShare;
  }
}

export default MySharingWidgetElement;
