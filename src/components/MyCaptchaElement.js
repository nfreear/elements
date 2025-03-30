/**
 * Wrapper around Google reCAPTCHA, using a modal 'dialog'.
 *
 * @see https://www.google.com/recaptcha/admin (Legacy)
 * @copyright NDF, 21-March-2025.
 * @status experimental
 * @since 1.7.0
 */
import MyMinElement from '../MyMinElement.js';

// <slot> doesn't seem to work inside <dialog>!
const TEMPLATE = `
<template>
  <slot></slot>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  <dialog part="dialog">
    <p part="p"></p>
    <form method="dialog">
      <button part="button" type="submit">OK</button>
    </form>
  </dialog>
</template>
`;

export class MyCaptchaElement extends MyMinElement {
  static getTag () { return 'my-captcha'; }

  get sitekey () { // Required (token)
    const KEY = this.getAttribute('sitekey');
    console.assert(KEY, 'The "sitekey" attribute is required (my-captcha)');
    return KEY;
  }

  get message () { // Optional (string)
    return this.getAttribute('message') || 'Please prove you’re not a robot.';
  }

  get capture () { // Optional (boolean)
    return !!this.getAttribute('capture');
  }

  get selector () { // Optional.
    return this.getAttribute('selector');
  }

  get value () { return this._responseElem.value; }

  get success () { return this.value !== ''; }

  connectedCallback () {
    const ELEM = document.createElement('div');
    ELEM.classList.add('g-recaptcha');
    ELEM.dataset.sitekey = this.sitekey;
    this.appendChild(ELEM); // Was: this.after(ELEM);

    this._attachLocalTemplate(TEMPLATE);
    const DIALOG = this.shadowRoot.querySelector('dialog form');
    const PARA = this.shadowRoot.querySelector('p');
    PARA.textContent = this.message;

    const OPT = this.capture ? { capture: true } : null;

    this._form.addEventListener('submit', (ev) => this._submitEventHandler(ev), OPT);

    DIALOG.addEventListener('submit', (ev) => this._onDialogClose(ev));

    window.addEventListener('message', (ev) => this._onIframeMessage(ev), false);

    console.debug('my-captcha:', this.sitekey.length, this.sitekey, this);
  }

  _submitEventHandler (ev) {
    if (this.success) {
      this._cascadeValue();
      console.debug('my-captcha - OK:', this.value.length, this.value.substring(0, 32), '…');
    } else {
      const dialog = this.shadowRoot.querySelector('dialog');
      dialog.showModal();

      ev.preventDefault();

      if (this.capture) {
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

  get _form () {
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
    if (this.selector) {
      const INPUT = document.querySelector(this.selector);
      console.assert(INPUT, `<input> - Not found: ${this.selector}`);
      INPUT.value = this.value;
    }
  }
}

export default MyCaptchaElement;
