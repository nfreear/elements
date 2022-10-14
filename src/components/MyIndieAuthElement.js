/**
 * Implementation of an "IndieAuth" client in the browser.

 * @see https://indielogin.com/api
 * @see https://indieauth.net/
 * @copyright © Nick Freear, 03-Oct-2022.
 */

import { MyElement } from '../MyElement.js';

const { crypto, fetch, location, postMessage, sessionStorage, URLSearchParams } = window;

/* const KEY_STATE = 'my-indie-auth.state';
const KEY_SUBMIT = 'my-indie-auth.submit';
const KEY_AUTH = 'my-indie-auth.auth';
const KEY_LOGOUT = 'my-indie-auth.logout';
*/

const TEMPLATE = `
<style>
  form p > * { line-height: 1.5; margin: .4rem 0; }
  button,input { font: inherit; }
  button { padding: .3rem 1.7rem; }
  input { padding: .3rem; width: 13rem; }
  a[ href *= indieauth ] { float: right; margin: .5rem; text-decoration: none; }
  a[ href *= indieauth ] > * { text-decoration: underline; }
  a[ href *= indieauth ]::after { content: '🔒'; margin-left: .2rem; }
</style>
<p role="alert"></p>
<form action="https://indielogin.com/auth" method="get">
  <p>
    <label for="url">Web Address</label>
    <input id="url" type="url" name="me" placeholder="yourdomain.com" required />
    <button type="submit">Sign In</button>
    <a href="https://indieauth.net/" title="OAuth for the open web"><small>IndieAuth</small></a>
  </p>
  <input type="hidden" name="client_id" value="https://example.com/" />
  <input type="hidden" name="redirect_uri" value="https://example.com/redirect" />
  <input type="hidden" name="state" value="[todo]" />
</form>
<div id="wrap" hidden><slot><!-- Logged in content. --></slot></div>
`;

export class MyIndieAuthElement extends MyElement {
  static getTag () {
    return 'my-indie-auth';
  }

  async connectedCallback () {
    this.$$ = {};
    // const name = this.getAttribute('name') || 'A name attribute';

    const ROOT = document.createElement('div');
    ROOT.innerHTML = TEMPLATE;

    this.attachShadow({ mode: 'open' }).appendChild(ROOT);

    this._initializeLoginForm();

    if (this._authenticated) {
      this._success();
    } else {
      this._processAuthRedirect();
    }
  }

  _initializeLoginForm () {
    // const MY_LOGIN = document.querySelector('my-login');
    this.$$.rootElem = document.documentElement;
    this.$$.statusElem = this.shadowRoot.querySelector('[ role = alert ]');
    this.$$.wrapElem = this.shadowRoot.querySelector('#wrap');
    this.$$.innerElem = this.children[0]; // this.parentElement.querySelector('my-indie-auth > *');
    const FORM = this.$$.formElem = this.shadowRoot.querySelector('form');
    const ELEMS = FORM.elements;

    const client_id = location.origin + '/';
    const redirect_uri = location.origin + location.pathname;

    const DATA = {
      time: new Date().toISOString(),
      client_id,
      redirect_uri,
      action: FORM.action,
      state: crypto.randomUUID() // += parseInt(Math.random() * 1000000);
    };

    ELEMS.client_id.value = DATA.client_id;
    ELEMS.redirect_uri.value = DATA.redirect_uri;
    ELEMS.state.value = DATA.state;

    ELEMS.me.addEventListener('blur', ev => this._blurHandler(ev));

    FORM.addEventListener('submit', ev => {
      this._setItem('state', DATA.state);
      this._setItem('submit', JSON.stringify(DATA));

      console.debug('my-indie-auth - Submit:', DATA, ev, ev.target, ELEMS);
    });

    console.debug('my-indie-auth - Form:', DATA, this.$$, this);
  }

  _blurHandler (ev) {
    const ELEM = ev.target;
    const VALUE = ev.target.value;

    if (VALUE && !VALUE.match(/^https?:/) && VALUE.match(/.+\..+/)) {
      ELEM.value = `https://${VALUE}`;
    }
    console.debug('my-indie-auth - Blur:', ELEM.value, ev);
  }

  async _processAuthRedirect () {
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

      console.debug('my-indie-auth - Match:', DATA, BODY.toString(), QRY);

      try {
        const RESP = await fetch(DATA.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            Accept: 'application/json'
          },
          body: BODY.toString()
        });
        const { status, ok } = RESP;
        const { error, error_description, me } = await RESP.json();

        console.debug('Auth resp:', ok, status, RESP);

        if (!ok) {
          /* error : "invalid_request"
          message : "The authorization code expired"
          status : 400 */
          return this._error(status, new Error(error_description));
        }

        if (ok) {
          return this._success(status, me);
        }
      } catch (ex) {
        return this._error(999, ex);
      }
      // this._error(500, { message: 'Unknown' });
    } else {
      console.debug('my-indie-auth - No auth redirect.');
    }
  }

  // const rootElem = document.documentElement;
  _success (httpStatus, me, already = false) {
    const message = `${this._authenticated ? 'Already a' : 'A'}uthenticated`;
    const AUTH = this._authenticated
      ? this._getAuth()
      : {
          httpStatus,
          me,
          message,
          time: new Date().toISOString()
        };

    if (!this._authenticated) {
      this._setItem('auth', JSON.stringify(AUTH));
    }

    // this.dataset = AUTH;
    this.dataset.me = AUTH.me;

    this.$$.rootElem.dataset.myIndieAuthMe = AUTH.me;
    this.$$.rootElem.dataset.myIndieAuthenticated = AUTH.time;
    this.$$.formElem.hidden = true;
    this.$$.wrapElem.hidden = false;
    this.$$.statusElem.textContent = `✔️ ${message}.`;

    if (this.$$.innerElem) {
      this.$$.innerElem.hidden = false;
    }

    this._postMessage('success', this._getAuth());

    console.debug(`✔️ my-indie-auth - ${message}.`, me);
  }

  _error (httpStatus, error) {
    this.$$.rootElem.dataset.myIndieAuthHttpStatus = httpStatus;
    this.$$.rootElem.dataset.myIndieAuthError = true;
    this.$$.rootElem.dataset.myIndieAuthenticated = false;
    this.$$.statusElem.textContent = '❌ Authentication Error.';

    this._postMessage('error', error);

    console.error('❌ my-indie-auth - Error:', { error });
  }

  _postMessage (status, data) {
    const { origin } = location;
    return postMessage({ tag: MyIndieAuthElement.getTag(), status, data }, origin);
  }

  _storeAuth (httpStatus, me) {
    this._setItem('auth', JSON.stringify({
      httpStatus,
      me,
      message: 'Authenticated',
      time: new Date().toISOString()
    }));
  }

  get _authenticated () {
    return !!this._getItem('auth');
  }

  _getAuth () {
    const AUTH = this._getItem('auth');
    return AUTH ? JSON.parse(AUTH) : null;
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
