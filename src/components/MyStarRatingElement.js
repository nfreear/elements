/*!

  © Nick Freear, 04-Dec-2021.

  Was: MyRadioStarRatingElement.
*/

import { MyElement } from '../MyElement.js';

export class MyStarRatingElement extends MyElement { // HTMLInputElement {
  static getTag () {
    return 'my-star-rating';
  }

  constructor () {
    super();

    const name = this.getAttribute('name') || 'my-star-rating-1';

    this.initialize({ name });
  }

  connectedCallback () {
    console.debug('connectedCallback:', this);
  }

  async initialize (attr) {
    const templates = await this.getTemplate('my-star-rating');

    const labels = this.shadowRoot.querySelectorAll('label');
    const fieldset = this.shadowRoot.querySelector('fieldset');

    const hiddenInput = this.createHiddenInput(attr.name);

    this.after(hiddenInput);

    this.$$ = {
      ...attr, hiddenInput, labels, fieldset, templates
    };

    this.appendStars(labels, templates[1]);

    fieldset.addEventListener('click', ev => this.clickEventHandler(ev));
    fieldset.addEventListener('mouseout', ev => {
      this.unfocusStars();
      // console.debug('mouseout');
    });

    console.debug('my-star-rating (radio):', this.$$, this);
  }

  createHiddenInput (name) {
    const INPUT = document.createElement('input');
    INPUT.id = 'my-star-rating-input-1';
    INPUT.type = 'hidden';
    INPUT.name = name;
    // INPUT.value = 0;
    // INPUT.setAttribute('data-stars', '0');
    return INPUT;
  }

  appendStars (labels, starSvgTemplate) {
    // const starSvgTemplate = templates[ 1 ];
    [...labels].forEach(label => {
      const starSvg = starSvgTemplate.content.cloneNode(true);

      label.appendChild(starSvg);
    });
  }

  updateValue (value) {
    this.title = `${value} stars`;
    this.setAttribute('data-value', value);
    // this.$$.hiddenInput.setAttribute('data-value', value);
    this.$$.hiddenInput.value = value;
  }

  unfocusStars () {
    [...this.$$.labels].map(label => label.classList.remove('focused'));
  }

  updateState (VALUE) {
    [...this.$$.labels].forEach((label, idx) => {
      label.setAttribute('data-star', idx < VALUE ? 'yes' : 'no');
    });
  }

  clickEventHandler (ev) {
    const LABEL = ev.target.parentElement;
    const VALUE = parseInt(ev.target.value); // Was: ev.target.getAttribute('data-rating'));

    if (ev.target.nodeName !== 'INPUT') { // NaN.
      this.unfocusStars();
      return;
    }

    this.updateValue(VALUE);
    this.updateState(VALUE);
    this.unfocusStars();

    LABEL.classList.add('focused');

    console.debug('Star rating. Click:', VALUE, VALUE ? 'ok' : 'err', ev);
  }
}

MyStarRatingElement.define(); //, { extends: 'input' });
