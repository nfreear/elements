import attachTemplate from '../util/attachTemplate.js';

/**
 * Wrapper around Google reCAPTCHA (v2 checkbox), using a modal 'dialog'.
 *
 * @see https://www.google.com/recaptcha/admin (Legacy)
 * @see https://developers.google.com/recaptcha/docs/display#auto_render (v2)
 * @copyright NDF, 21-March-2025.
 * @customElement my-captcha
 * @demo https://nfreear.github.io/elements/demo/my-element-filter.html
 * @status experimental, an-form
 * @since 1.7.0
 */
export class MyCaptchaElement extends HTMLElement {
  static getTag () { return 'my-captcha'; }

  // <slot> doesn't seem to work inside <dialog>!
  get #htmlTemplate () {
    return `
  <template>
    <slot></slot>
    <script src="https://www.google.com/recaptcha/api.js?hl=${this._lang}" async defer></script>
    <dialog part="dialog">
      <p part="p">${this.message}</p>
      <form method="dialog">
        <button part="button" type="submit">OK</button>
      </form>
    </dialog>
  </template>
  `;
  }

  /** Attribute (required) - sitekey.
   * @return {string} */
  get sitekey () {
    const KEY = this.getAttribute('sitekey');
    console.assert(KEY, 'The "sitekey" attribute is required (my-captcha)');
    return KEY;
  }

  /** Attribute (optional) - Dialog message.
   * @return {string} */
  get message () {
    return this.getAttribute('message') || 'Please prove you’re not a robot.';
  }

  /** Attribute (optional) - whether to listen for form submit in the capturing phase.
   * @return {boolean} */
  get eventCapture () {
    return this.hasAttribute('event-capture');
  }

  get inputSelector () { // Optional.
    return this.getAttribute('input-selector');
  }

  get value () { return this.#responseElem.value; }

  get success () { return this.value !== ''; }

  get _lang () { return this.lang || 'en'; }

  connectedCallback () {
    this.#createCaptchaElement();

    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);

    const OPT = this.eventCapture ? { capture: true } : null;

    this.#closestForm.addEventListener('submit', (ev) => this.#onFormSubmit(ev), OPT);

    this.#dialogElem.addEventListener('submit', (ev) => this.#onDialogClose(ev));

    window.addEventListener('message', (ev) => this.#onIframeMessage(ev), false);

    console.debug('my-captcha:', this.sitekey.length, this.sitekey, this);
  }

  get #dialogElem () {
    return this.shadowRoot.querySelector('dialog form');
  }

  #createCaptchaElement () {
    const ELEM = document.createElement('div');
    ELEM.classList.add('g-recaptcha');
    ELEM.dataset.sitekey = this.sitekey;
    this.appendChild(ELEM); // Was: this.after(ELEM);
  }

  #onFormSubmit (ev) {
    if (this.success) {
      this.#cascadeValue();
      console.debug('my-captcha - OK:', this.value.length, this.value.substring(0, 32), '…');
    } else {
      const dialog = this.shadowRoot.querySelector('dialog');
      dialog.showModal();

      ev.preventDefault();

      if (this.eventCapture) {
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
      console.debug('my-captcha - Show dialog.');
    }
  }

  get #trustedOrigins () {
    return ['https://www.google.com'];
  }

  #onIframeMessage (msg) {
    if (!this.#trustedOrigins.includes(msg.origin)) { return; }

    this.#cascadeValue(); // Reset!
    const DT = new Date().toTimeString();
    console.debug('my-captcha - Iframe message:', msg.data, DT, msg);
  }

  #onDialogClose (ev) {
    // Accessibility: set focus back on the <iframe>.
    setTimeout(() => {
      this.#iframeElem.removeAttribute('role');
      this.#iframeElem.setAttribute('tabindex', '-1');
      this.#iframeElem.focus();
      this.#iframeElem.removeAttribute('tabindex');

      console.debug('my-captcha - Dialog close:', ev);
    },
    100);
  }

  get #closestForm () {
    const FORM = this.closest('form');
    console.assert(FORM, '<form> - Not found (my-captcha)');
    return FORM;
  }

  get #iframeElem () {
    const ELEM = this.querySelector('iframe[src ^= "https://www.google.com/rec"]');
    console.assert(ELEM, '<iframe> - Not found');
    return ELEM;
  }

  get #responseElem () {
    const ELEM = this.querySelector('#g-recaptcha-response'); // Was: document.que...
    console.assert(ELEM, '#g-recaptcha-response - Element not found (my-captcha)');
    return ELEM;
  }

  #cascadeValue () {
    if (this.inputSelector) {
      const inputElem = document.querySelector(this.inputSelector);
      console.assert(inputElem, `<input> - Not found: ${this.inputSelector}`);
      inputElem.value = this.value;
    }
  }
}

export default MyCaptchaElement;
