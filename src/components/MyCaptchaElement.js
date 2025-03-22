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
    <p part="p">
      Please prove you’re not a robot.</slot>
    </p>
    <form method="dialog">
      <button part="button" type="submit">OK</button>
    </form>
  </dialog>
</template>
`;

export class MyCaptchaElement extends MyMinElement {
  get sitekey () {
    const KEY = this.getAttribute('sitekey');
    console.assert(KEY, 'The "sitekey" attribute is required (my-captcha)');
    return KEY;
  }

  get capture () {
    return !!this.getAttribute('capture');
  }

  get value () { return this._responseElem.value; }

  get success () { return this.value !== ''; }

  connectedCallback () {
    const ELEM = document.createElement('div');
    ELEM.classList.add('g-recaptcha');
    ELEM.dataset.sitekey = this.sitekey;
    this.after(ELEM);

    this._attachLocalTemplate(TEMPLATE);

    const OPT = this.capture ? { capture: true } : null;

    this._form.addEventListener('submit', (ev) => this._submitEventHandler(ev), OPT);

    console.debug('my-captcha:', this.sitekey, this);
  }

  _submitEventHandler (ev) {
    if (this.success) {
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
}

export default MyCaptchaElement;
