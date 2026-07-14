const { CommandEvent, HTMLElement } = window;

/* export class MyCommandEvent extends CommandEvent {
  #value;
  get value () { return this.#value; }
  constructor (type, options) {
    super(type, options);
    this.#value = /* typeof options.value === 'undefined' ? *-/ options.value;
  }
} */

/**
 * Use a checkbox to toggle a `data-` attribute and dispatch a `CommandEvent`.
 *
 * @customElement my-toggle-data
 */
export class MyToggleDataElement extends HTMLElement {
  #checkBox;
  static getTag () { return 'my-toggle-data'; }
  get #command () { return '--my-toggle-data'; }
  get #dataName () { return 'myToggleData'; }

  get checked () { return this.#checkBox.checked; }

  get #initialChecked () { return this.hasAttribute('initial-checked'); }

  get #selector () { return this.getAttribute('selector'); }

  get #target () {
    if (this.#selector) {
      const ELEM = document.querySelector(this.#selector);
      console.assert(ELEM, `Selector not found: ${this.#selector}`);
      return ELEM;
    }
    return document.documentElement;
  }

  connectedCallback () {
    console.assert(this.#target);
    const { checkBox, label } = this.#createElements();
    this.#checkBox = checkBox;

    this.attachShadow({ mode: 'open' }).appendChild(label);

    checkBox.addEventListener('change', (ev) => this.#onChange(ev));
  }

  #onChange (ev) {
    const { checked } = ev.target;

    this.#target.dataset[this.#dataName] /* .myToggleFlag */ = checked;

    const commandEvent = new CommandEvent('command', {
      command: this.#command, // `--my-toggle-flag-${checked}`,
      // value: checked,
      source: this,
      bubbles: true
    });
    this.dispatchEvent(commandEvent);
    // Was: this.#target.dispatchEvent(commandEvent);
  }

  #createElements () {
    const checkBox = document.createElement('input');
    const label = document.createElement('label');
    const slot = document.createElement('slot');

    label.setAttribute('part', 'label');
    checkBox.setAttribute('part', 'input cb');
    checkBox.type = 'checkbox';
    if (this.#initialChecked) {
      checkBox.setAttribute('checked', '');
    }

    label.appendChild(checkBox);
    label.appendChild(slot);

    slot.textContent = ' My toggle data';

    return { checkBox, label, slot };
  }
}

export default MyToggleDataElement;
