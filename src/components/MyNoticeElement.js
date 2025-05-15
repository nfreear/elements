/**
 * A dismissable notice.
 *
 * For example, an EU cookie-law notice!
 *
 * @copyright © Nick Freear, 07-Jan-2022.
 * @customElement my-notice
 */

import { MyElement } from '../MyElement.js';

const { localStorage } = window;

export class MyNoticeElement extends MyElement {
  static getTag () {
    return 'my-notice';
  }

  async connectedCallback () {
    const position = this.getAttribute('position') || 'bottom';
    const isCookieNotice = this.getAttribute('is-cookie-notice') || true;
    const storageKey = this.getAttribute('storage-key') || 'my-cookie-notice';
    const state = this._getState(storageKey);

    this.$$ = { position, isCookieNotice, storageKey, state };

    await this._initialize(this.$$);

    // this.getTemplate('my-notice').then(() => this._initialize());
  }

  async _initialize (attr) {
    await this.getTemplate('my-notice');

    this._clickHandlers();

    const WRAP = this.shadowRoot.querySelector('.my-notice-inner');

    WRAP.classList.add(`position-${attr.position}`);
    WRAP.classList.add(attr.isCookieNotice ? 'is-cookie-notice' : 'not-cookie-notice');

    this.$$.inner = WRAP;

    this._setVisibility();

    console.debug('my-notice:', this.$$, this);
  }

  _reset () {
    const KEY = this.$$.storageKey;
    localStorage.removeItem(`${KEY}-state`);
    localStorage.removeItem(`${KEY}-time`);
    console.debug('my-notice: Reset.');
  }

  _saveState (state) {
    const KEY = this.$$.storageKey;
    localStorage.setItem(`${KEY}-state`, state);
    localStorage.setItem(`${KEY}-time`, new Date());
  }

  _getState (key) {
    const KEY = key || this.$$.storageKey;
    const state = localStorage.getItem(`${KEY}-state`);
    const time = localStorage.getItem(`${KEY}-time`);

    return state ? { state, time } : null;
  }

  _setVisibility () {
    this.$$.inner.classList.remove('show');
    this.$$.inner.classList.remove('hide');
    this.$$.inner.classList.add(this._getState() ? 'hide' : 'show');
  }

  _clickHandlers () {
    const BUTTONS = this.shadowRoot.querySelectorAll('.notice-buttons > button');

    [...BUTTONS].forEach(BTN => BTN.addEventListener('click', ev => {
      ev.preventDefault();

      const STATE = ev.target.getAttribute('data-button');

      this._saveState(STATE);
      this._setVisibility();

      console.debug('my-notice. Click:', STATE, ev);
    }));
  }
}
