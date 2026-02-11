/**
 * Filter a collection of options/elements, based on the value of a search input field.
 * A combobox component, with autocomplete.
 *
 * @customElement popover-filter
 * @demo https://codepen.io/nfreear/pen/QwEBORL
 * @status
 */
export class MyPopoverFilterElement extends HTMLElement {
  #optionElements;
  #inputElem;
  #buttonElem;
  #popoverElem;
  #outputElem;
  #count = 0;

  /*
    Public API.
  */
  /** @return {string} */
  static getTag () {
    return 'my-popover-filter';
  }

  /** Attribute (required) - a CSS selector for the collection of elements to filter.
   * (Queried relative to `this` element - `this.querySelectorAll(this.selector)`.)
   * @return {string}
   */
  get #selector () {
    const selector = this.getAttribute('selector') ?? 'button';
    if (!selector) {
      throw new Error('"selector" is a required attribute (CSS selector syntax).');
    }
    return selector;
  }

  /** Attribute (optional)- text label for the filter input field.
   * @return {string}
   */
  get #label () { return this.getAttribute('label') || 'Filter'; }
  get #type () { return this.getAttribute('type') ?? 'text'; }
  get #autocomplete () { return this.getAttribute('autocomplete') ?? 'off'; }

  /** @return {boolean} */
  get #addAria () { return this.hasAttribute('add-aria'); }
  get #setInput () { return this.hasAttribute('set-input'); }

  /** @return {number} */
  get #minlength () { return parseInt(this.getAttribute('minlength') || 1); }
  get #selectDelay () { return parseInt(this.getAttribute('select-delay') || 250); } // Milliseconds.

  /** @return {string} */
  get #outputTemplate () {
    return this.getAttribute('output-template') || '%d results';
  }

  /** Get/ set the value of the filter input field.
   * @return {string}
   */
  get value () { return this.#inputElem.value.trim(); }

  set value (strValue) {
    this.#inputEventHandler(this.#mockEvent(strValue));
    this.#inputElem.value = strValue;
  }

  get count () { return this.#count; }

  get _stylesheetUrl () { return import.meta.resolve('../style/my-popover-filter.css'); }

  /** Life cycle callbacks.
   * @return {void}
   */
  connectedCallback () {
    const rootElem = this.attachShadow({ mode: 'open' });
    const { input, output, button, popover } = this.#createElements(rootElem);

    this.#inputElem = input;
    this.#buttonElem = button;
    this.#outputElem = output;
    this.#popoverElem = popover;

    this.#inputElem.addEventListener('input', (ev) => this.#inputEventHandler(ev));
    this.#popoverElem.addEventListener('click', (ev) => this.#clickEventHandler(ev));
    this.#popoverElem.addEventListener('toggle', (ev) => this.#toggleEventHandler(ev));

    this.dataset.ready = true;

    console.debug('my-popover-filter:', [this]);
  }

  /*
    Private helpers.
  */

  /** @return {HTMLInputElement} */

  #lazyLoadElements () {
    if (!this.#optionElements) {
      this.#optionElements = this.querySelectorAll(this.#selector);
    }
    if (!this.#optionElements) {
      throw new Error(`No elements found with selector: ${this.#selector}`);
    }
    if (this.#addAria) {
      this.#optionElements.forEach((el) => el.setAttribute('role', 'option'));
    }
  }

  #resetOptions () {
    this.#optionElements.forEach((el) => el.removeAttribute('aria-selected'));
  }

  #inputEventHandler (ev) {
    // Late initialization - allow other (custom element) JS to run first!
    this.#lazyLoadElements();

    const { count } = this.#filterElements(this.value);

    this.#setPopoverState(count, ev);
    this.#setOutput(count);

    this.dataset.query = this.value;
    this.dataset.count = this.#count = count;
    this.dataset.total = this.#optionElements.length;

    console.debug('input:', count, this.value, ev);
  }

  #clickEventHandler (ev) {
    const { target } = ev;
    if (target.tagName === 'BUTTON' && this.#setInput) {
      this.#resetOptions();
      target.setAttribute('aria-selected', 'true');
      this.#inputElem.value = target.textContent;
      setTimeout(() => this.#setPopoverState(false), this.#selectDelay);
    }
    console.debug('click:', target, ev);
  }

  #toggleEventHandler (ev) {
    const { newState } = ev;
    if (newState === 'closed') {
      this.#setPopoverState(false);
    }
    console.debug('toggle:', newState, ev);
  }

  #setPopoverState (show, ev = null) {
    if (show) {
      this.#popoverElem.showPopover({ source: ev.target });
    } else {
      this.#popoverElem.hidePopover();
    }
    this.#inputElem.setAttribute('aria-expanded', !!show);
  }

  #filterElements (queryStr) {
    const filtered = [...this.#optionElements].filter((el) => {
      const text = el.textContent;
      const value = el.value;
      const found = this.#defaultFilter(queryStr, { text, value });
      if (found) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
      return found;
    });
    return { filtered, count: filtered.length };
  }

  #defaultFilter (query, { text }) {
    const found = text.toLowerCase().includes(query.toLowerCase());
    return !!found;
  }

  #mockEvent (value) { return { mockEvent: true, target: { value } }; }

  #setOutput (count) {
    this.#outputElem.value = this.#outputTemplate.replace('%d', count);
  }

  #createElement (tagName, partAttr, attributes = []) {
    const elem = document.createElement(tagName);
    const part = typeof partAttr === 'undefined' || partAttr === -1 ? tagName : partAttr;
    if (partAttr !== false) {
      elem.setAttribute('part', part);
    }
    attributes.forEach(([attr, value]) => { elem.setAttribute(attr, value); });
    return elem;
  }

  #createElements (rootElem) {
    const pID = 'popoverID';
    const label = this.#createElement('label', -1, [['for', 'search'], ['id', 'labelID']]);
    const input = this.#createElement('input', -1, [['id', 'search'], ['role', 'combobox'], ['aria-expanded', 'false']]);
    const button = this.#createElement('button', -1, [['aria-labelledby', 'labelID']]);
    const output = this.#createElement('output');
    const popover = this.#createElement('div', 'popover', [['id', pID], ['popover', ''], ['aria-labelledby', 'labelID']]);
    // const listBox = this.#createElement('div', false, [['aria-labelledby', 'labelID']]);
    const slotElem = document.createElement('slot');

    label.textContent = this.#label;

    input.type = this.#type;
    input.setAttribute('autocomplete', this.#autocomplete);

    input.setAttribute('popovertarget', pID);
    button.setAttribute('popovertarget', pID);

    // listBox.appendChild(slotElem);
    popover.appendChild(slotElem);

    rootElem.appendChild(label);
    rootElem.appendChild(input);
    rootElem.appendChild(button);
    rootElem.appendChild(output);
    rootElem.appendChild(popover);

    if (this.#addAria) {
      popover.setAttribute('role', 'listbox');
    }

    return { label, input, button, output, popover };
  }
}

export default MyPopoverFilterElement;
