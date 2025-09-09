import attachTemplate from '../util/attachTemplate.js';

/**
 * @customElement my-wake-lock
 * @demo ../demo/my-wake-lock.html
 */
export class MyWakeLockElement extends HTMLElement {
  #wakeLock = null;

  static getTag () { return 'my-wake-lock'; }

  get isSupported () { return 'wakeLock' in navigator; }

  connectedCallback () {
    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);

    if (!this.isSupported) {
      this.#formElem.output.value = 'Wake lock is not supported by this browser.';
      console.warn('Wake lock is not supported by this browser.');
      this.dataset.error = 'Wake lock API not supported';
      return;
    }

    this.#formElem.button.addEventListener('click', (ev) => this.#toggle(ev));
    // this.#formElem.checkbox.addEventListener('change', (ev) => this.#toggle(ev));
  }

  async #toggle (ev) {
    if (ev) { ev.preventDefault(); }

    console.debug('Toggle wakeLock:', this.#wakeLock, ev);
    if (this.#wakeLock) {
      this.#wakeLock.release().then(() => {
        this.#wakeLock = null;
        this.#formElem.output.value = 'Wake lock released.';
        this.#formElem.button.setAttribute('aria-pressed', 'false');
        this.#sliderElem.setAttribute('part', 'slider slider-off');
      });
    } else {
      try {
        this.#wakeLock = await navigator.wakeLock.request('screen');
        this.#formElem.output.value = 'Wake lock is active!';
        this.#formElem.button.setAttribute('aria-pressed', 'true');
        this.#sliderElem.setAttribute('part', 'slider slider-on');
      } catch (err) {
        // The Wake Lock request has failed - usually system related, such as battery.
        this.#formElem.output.value = `${err.name}, ${err.message}`;
        this.dataset.error = `${err.name}, ${err.message}`;
        console.error('wakeLock Error.', err);
      }
    }
  }

  get #formElem () { return this.shadowRoot.querySelector('form').elements; }

  get #sliderElem () { return this.shadowRoot.querySelector('#slider'); }

  get #htmlTemplate () {
    return `
  <template>
  <form part="container">
    <button name="button" part="button switch" aria-pressed="false" type="button">
      <!-- <input type="checkbox" name="checkbox" part="input check cb"> -->
      <span id="slider" part="slider"></span>
      <span part="text">
        <slot>Wake lock</slot>
      </span>
    </button>
    <output name="output" part="output"></output>
  </form>
  </template>`;
  }
}

export default MyWakeLockElement;
