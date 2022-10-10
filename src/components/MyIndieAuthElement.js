/**
 * Implementation of an "IndieAuth" client in the browser.

 * @see https://indielogin.com/api
 * @see https://indieauth.net/
 * @copyright © Nick Freear, 03-Oct-2022.
 */

import { MyElement } from '../MyElement.js';

const { fetch, location, sessionStorage, URLSearchParams } = window;

/* const KEY_STATE = 'my-indie-auth.state';
const KEY_SUBMIT = 'my-indie-auth.submit';
const KEY_AUTH = 'my-indie-auth.auth';
const KEY_LOGOUT = 'my-indie-auth.logout';
*/

const TEMPLATE = `
<form action="https://indielogin.com/auth" method="get">
  <label for="url">Web Address:</label>
  <input id="url" type="url" name="me" placeholder="yourdomain.com" required />
  <p><button type="submit">Sign In</button></p>
  <input type="hidden" name="client_id" value="https://example.com/" />
  <input type="hidden" name="redirect_uri" value="https://example.com/redirect" />
  <input type="hidden" name="state" value="[todo]" />
</form>
`;

export class MyIndieAuthElement extends MyElement {
  static getTag () {
    return 'my-indie-auth';
  }

  async connectedCallback () {
    // const name = this.getAttribute('name') || 'A name attribute';

    const ROOT = document.createElement('div');
    ROOT.innerHTML = TEMPLATE;

    this.attachShadow({ mode: 'open' }).appendChild(ROOT);

    this._initializeLoginForm();
  }

  _initializeLoginForm () {
    // const MY_LOGIN = document.querySelector('my-login');
    const FORM = this.shadowRoot.querySelector('form');
    const ELEMS = FORM.elements;

    const client_id = location.origin + '/';
    const redirect_uri = location.origin + location.pathname;

    const DATA = {
      time: new Date().toISOString(),
      client_id,
      redirect_uri,
      action: FORM.action,
      state: crypto.randomUUID(), // += parseInt(Math.random() * 1000000);
    }

    ELEMS.client_id.value = DATA.client_id;
    ELEMS.redirect_uri.value = DATA.redirect_uri;
    ELEMS.state.value = DATA.state;

    ELEMS.me.addEventListener('blur', ev => this._blurHandler(ev));

    FORM.addEventListener('submit', ev => {
      this._setItem('state', DATA.state);
      this._setItem('submit', JSON.stringify(DATA));

      console.debug('my-indie-auth - Submit:', DATA, ev, ev.target, ELEMS);
    });

    console.debug('my-indie-auth:', DATA, this);
  }

  _blurHandler (ev) {
    const ELEM = ev.target;
    const VALUE = ev.target.value;

    if (VALUE && !VALUE.match(/^https?:/) && VALUE.match(/.+\..+/)) {
      ELEM.value = `https://${VALUE}`;
    }
    console.debug('my-indie-auth - Blur:', ELEM.value, ev);
  }

  _processAuthRedirect () {
    const STATE = this._getItem('state');
    const QRY = new URLSearchParams(location.search);

    if (STATE && QRY.has('code') && QRY.get('state') === STATE) {
    // if (STATE && M_STATE && M_CODE && STATE === M_STATE[1]) {
      const DATA = STATE ? JSON.parse(this._getItem('submit')) : null;

      const BODY = new URLSearchParams({
        code: QRY.get('code'),
        redirect_uri: DATA.redirect_uri,
        client_id: DATA.client_id
      });

      console.debug('MATCH! ::', DATA, BODY.toString(), QRY);
      return;
    }
  }

  _removeItems () {
    const KEYS = ['state', 'submit', 'auth'];
    KEYS.forEach(key => sessionStorage.removeItem(`my-indie-auth.${key}`));

    return this._setItem('logout', new Date().toISOString());
  }

  _setItem (key, value) {
    return sessionStorage.setItem(`my-indie-auth.${key}`, value);
  }

  _getItem (key) {
    return sessionStorage.getItem(`my-indie-auth.${key}`);
  }
}

MyIndieAuthElement.define();
