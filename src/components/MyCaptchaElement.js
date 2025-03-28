/**
 * Wrapper around Google reCAPTCHA, using a modal 'dialog'.
 *
 * @copyright NDF, 21-March-2025.
 * @status experimental
 * @since 1.7.0
 */
import MyMinElement from '../MyMinElement.js';

// <slot> doesn't seem to work in <dialog>!
const TEMPLATE = `
<template>
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

  get sitekey () {
    const KEY = this.getAttribute('sitekey');
    console.assert(KEY, 'The "sitekey" attribute is required (my-captcha)');
    return KEY;
  }

  get message () {
    return this.getAttribute('message') || 'Please prove you’re not a robot.';
  }

  get capture () {
    return !!this.getAttribute('capture');
  }

  get selector () {
    return this.getAttribute('selector');
  }

  get value () { return this._responseElem.value; }

  get success () { return this.value !== ''; }

  connectedCallback () {
    const ELEM = document.createElement('div');
    ELEM.classList.add('g-recaptcha');
    ELEM.dataset.sitekey = this.sitekey;
    this.after(ELEM);

    this._attachLocalTemplate(TEMPLATE);
    const PARA = this.shadowRoot.querySelector('p');
    PARA.textContent = this.message;

    const OPT = this.capture ? { capture: true } : null;

    this._form.addEventListener('submit', (ev) => this._submitEventHandler(ev), OPT);

    window.addEventListener('message', (ev) => this._onIframeMessage(ev), false);

    console.debug('my-captcha:', this.sitekey, this);
  }

  _submitEventHandler (ev) {
    if (this.success) {
      this._cascadeValue();
      console.debug('my-captcha - OK:', this.value);
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

    console.debug('my-captcha - Iframe message:', msg.data, msg);
  }

  get _form () {
    const FORM = this.closest('form');
    console.assert(FORM, '<form> - Not found (my-captcha)');
    return FORM;
  }

  get _responseElem () {
    const ELEM = document.querySelector('#g-recaptcha-response');
    console.assert(ELEM, '#g-recaptcha-response - Not found (my-captcha)');
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
