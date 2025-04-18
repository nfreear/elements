
import MyMinElement from '../MyMinElement.js';

/**
 * Wrapper around Google reCAPTCHA (v2 checkbox), using a modal 'dialog'.
 *
 * @see https://www.google.com/recaptcha/admin (Legacy)
 * @see https://developers.google.com/recaptcha/docs/display#auto_render (v2)
 * @copyright NDF, 21-March-2025.
 * @customElement my-captcha
 * @demo https://nfreear.github.io/elements/demo/my-element-filter.html
 * @status experimental
 * @since 1.7.0
 */
export class MyCaptchaElement extends MyMinElement {
  static getTag () { return 'my-captcha'; }

  // <slot> doesn't seem to work inside <dialog>!
  get _template () {
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
    return !!this.getAttribute('event-capture');
  }

  get inputSelector () { // Optional.
    return this.getAttribute('input-selector');
  }

  get value () { return this._responseElem.value; }

  get success () { return this.value !== ''; }

  get _lang () { return this.lang || 'en'; }

  connectedCallback () {
    const ELEM = document.createElement('div');
    ELEM.classList.add('g-recaptcha');
    ELEM.dataset.sitekey = this.sitekey;
    this.appendChild(ELEM); // Was: this.after(ELEM);

    this._attachLocalTemplate(this._template);
    const DIALOG = this.shadowRoot.querySelector('dialog form');

    const OPT = this.eventCapture ? { capture: true } : null;

    this._closestForm.addEventListener('submit', (ev) => this._onFormSubmit(ev), OPT);

    DIALOG.addEventListener('submit', (ev) => this._onDialogClose(ev));

    window.addEventListener('message', (ev) => this._onIframeMessage(ev), false);

    console.debug('my-captcha:', this.sitekey.length, this.sitekey, this);
  }

  _onFormSubmit (ev) {
    if (this.success) {
      this._cascadeValue();
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

  get _trustedOrigins () {
    return ['https://www.google.com'];
  }

  _onIframeMessage (msg) {
    if (!this._trustedOrigins.includes(msg.origin)) { return; }

    this._cascadeValue(); // Reset!
    const DT = new Date().toTimeString();
    console.debug('my-captcha - Iframe message:', msg.data, DT, msg);
  }

  _onDialogClose (ev) {
    // Accessibility: set focus back on the <iframe>.
    setTimeout(() => {
      this._iframeElem.removeAttribute('role');
      this._iframeElem.setAttribute('tabindex', '-1');
      this._iframeElem.focus();
      this._iframeElem.removeAttribute('tabindex');

      console.debug('my-captcha - Dialog close:', ev);
    },
    100);
  }

  get _closestForm () {
    const FORM = this.closest('form');
    console.assert(FORM, '<form> - Not found (my-captcha)');
    return FORM;
  }

  get _iframeElem () {
    const ELEM = this.querySelector('iframe[src ^= "https://www.google.com/rec"]');
    console.assert(ELEM, '<iframe> - Not found');
    return ELEM;
  }

  get _responseElem () {
    const ELEM = this.querySelector('#g-recaptcha-response'); // Was: document.que...
    console.assert(ELEM, '#g-recaptcha-response - Element not found (my-captcha)');
    return ELEM;
  }

  _cascadeValue () {
    if (this.inputSelector) {
      const inputElem = document.querySelector(this.inputSelector);
      console.assert(inputElem, `<input> - Not found: ${this.inputSelector}`);
      inputElem.value = this.value;
    }
  }
}

export default MyCaptchaElement;
