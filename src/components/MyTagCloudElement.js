const { HTMLElement } = globalThis;

/**
 *
 * @customElement my-tag-cloud
 */
export class MyTagCloudElement extends HTMLElement {
  #cssVarName = '--my-log';

  static getTag () { return 'my-tag-cloud'; }

  get #labelText () { return this.getAttribute('label') ?? 'Tag cloud (experimental)'; }

  get #jsonElement () { return this.querySelector('script[type *= json]'); }
  get #tagElements () { return this.querySelectorAll('li a'); }

  get #tagData () {
    console.assert(this.#jsonElement, 'Missing JSON element');
    const json = this.#jsonElement.textContent;
    return JSON.parse(json);
  }

  #findTag (tag) {
    console.assert(this.#tagData && this.#tagData.tags.length, 'Missing tag data');
    return this.#tagData.tags.find(it => it.tag.toLowerCase() === tag.toLowerCase());
  }

  constructor () {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const { slot, label, input } = this.#createElements();
    root.appendChild(label);
    root.appendChild(slot);
    input.addEventListener('change', (ev) => this.#onChange(ev));
  }

  connectedCallback () {
    console.assert(this.#tagElements.length, 'Missing tag elements');

    this.#tagElements.forEach((el) => {
      const entry = this.#findTag(el.dataset.tag);
      const parentEl = el.parentElement;
      parentEl.dataset.count = entry ? entry.count : 0;
      if (entry) {
        const log = Math.log10(entry.count);
        parentEl.dataset.log = log;
        parentEl.style = `${this.#cssVarName}:${log};`;
      } else {
        parentEl.dataset.log = 0;
      }
    });

    console.debug('my-tag-cloud:', [this]);
  }

  #createElements () {
    const slot = document.createElement('slot');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');

    input.type = 'checkbox';
    span.textContent = this.#labelText;
    label.setAttribute('part', 'label');

    label.appendChild(input);
    label.appendChild(span);

    return { slot, label, input, span };
  }

  #onChange (event) {
    const { checked } = event.target;

    this.dataset.active = checked;

    console.debug(event.type, checked, event);
  }
}

export default MyTagCloudElement;

// customElements.define('my-tag-cloud', MyTagCloudElement);
