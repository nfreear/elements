/**
 * Switch between dark and light modes. Store the setting.
 *
 * @copyright © Nick Freear, 11-June-2022.
 * @see https://gist.github.com/nfreear/3940b62ef375386de921b4eaa82ea804
 * @see https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/#,
 * @status experimental
 * @since 1.3.0
 */

import { MyElement } from '../MyElement.js';

const { localStorage, matchMedia } = window;

export class MyUserThemeSwitchElement extends MyElement {
  static getTag () {
    return 'my-user-theme-switch';
  }

  async connectedCallback () {
    const addStyle = this.getAttribute('add-style') === 'true';
    const isCompact = this.getAttribute('layout') === 'compact';

    const TEMPLATES = await this.getTemplate('my-user-theme-switch');

    if (addStyle) {
      this._addDocumentStyle(TEMPLATES[1]);
    }

    const override = null;
    const prefersDarkScheme = matchMedia('(prefers-color-scheme: dark)');
    const prefersTheme = prefersDarkScheme.matches ? 'dark' : 'light';
    const currentSetting = override || this._get() || prefersTheme;

    const TOGGLER = this.shadowRoot.querySelector('.dark-mode-toggler');

    const CURRENT_BTN = TOGGLER.querySelector(`[ data-theme = ${currentSetting} ]`);

    this._pressButton(CURRENT_BTN);
    this._apply(currentSetting);

    TOGGLER.classList.add(`layout-${isCompact ? 'compact' : 'normal'}`);

    TOGGLER.addEventListener('click', ev => this._clickHandler(ev));

    console.debug('my-user-theme-switch:', currentSetting, this);
  }

  _apply (theme) {
    document.documentElement.setAttribute('data-my-user-theme', theme);
  }

  _save (theme) {
    localStorage.setItem('my-user-theme', theme);
    localStorage.setItem('my-user-theme.date', new Date().toISOString());
  }

  _get () {
    return localStorage.getItem('my-user-theme');
  }

  _pressButton (BTN) {
    const BUTTONS = this.shadowRoot.querySelectorAll('button');

    // Reset.
    BUTTONS.forEach(btn => btn.setAttribute('aria-pressed', 'false'));

    BTN.setAttribute('aria-pressed', 'true');
  }

  _clickHandler (ev) {
    ev.preventDefault();

    const THEME = ev.target.dataset.theme;

    if (!THEME) return;

    this._pressButton(ev.target);
    this._save(THEME);
    this._apply(THEME);

    console.debug('my-user-theme-switch. Click:', THEME, ev);
  }

  _addDocumentStyle (template) {
    const STYLE_NODE = template.content.cloneNode(true);
    const STYLE = STYLE_NODE.querySelector('style');

    document.head.appendChild(STYLE_NODE);

    console.debug('Document - add style:', STYLE);
  }
}

MyUserThemeSwitchElement.define();
