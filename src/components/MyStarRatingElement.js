/**
 * A keyboard-accessible interactive to give a star rating.
 *
 * @copyright © Nick Freear, 04-Dec-2021.
 *
 * @WAS MyRadioStarRatingElement.
 * @see ../demo/my-star-rating.html
 * @status beta
 * @since 1.0.0
 */

import { MyElement } from '../MyElement.js';

export class MyStarRatingElement extends MyElement { // HTMLInputElement {
  static getTag () {
    return 'my-star-rating';
  }

  async connectedCallback () {
    const name = this.getAttribute('name') || 'my-star-rating-1';

    await this._initialize({ name });
  }

  async _initialize (attr) {
    const templates = await this.getTemplate('my-star-rating');

    const labels = this.shadowRoot.querySelectorAll('label');
    const fieldset = this.shadowRoot.querySelector('fieldset');

    const hiddenInput = this._createHiddenInput(attr.name);

    this.after(hiddenInput);

    this.$$ = {
      ...attr, hiddenInput, labels, fieldset, templates
    };

    this._appendStars(labels, templates[1]);

    fieldset.addEventListener('click', ev => this._clickEventHandler(ev));
    fieldset.addEventListener('mouseout', ev => {
      this._unfocusStars();
      // console.debug('mouseout');
    });

    console.debug('my-star-rating (radio):', this.$$, this);
  }

  _createHiddenInput (name) {
    const INPUT = document.createElement('input');
    INPUT.id = 'my-star-rating-input-1';
    INPUT.type = 'hidden';
    INPUT.name = name;
    // INPUT.value = 0;
    // INPUT.setAttribute('data-stars', '0');
    return INPUT;
  }

  _appendStars (labels, starSvgTemplate) {
    // const starSvgTemplate = templates[ 1 ];
    [...labels].forEach(label => {
      const starSvg = starSvgTemplate.content.cloneNode(true);

      label.appendChild(starSvg);
    });
  }

  _updateValue (value) {
    this.title = `${value} stars`;
    this.setAttribute('data-value', value);
    // this.$$.hiddenInput.setAttribute('data-value', value);
    this.$$.hiddenInput.value = value;
  }

  _unfocusStars () {
    [...this.$$.labels].map(label => label.classList.remove('focused'));
  }

  _updateState (VALUE) {
    [...this.$$.labels].forEach((label, idx) => {
      label.setAttribute('data-star', idx < VALUE ? 'yes' : 'no');
    });
  }

  _clickEventHandler (ev) {
    const LABEL = ev.target.parentElement;
    const VALUE = parseInt(ev.target.value); // Was: ev.target.getAttribute('data-rating'));

    if (ev.target.nodeName !== 'INPUT') { // NaN.
      this._unfocusStars();
      return;
    }

    this._updateValue(VALUE);
    this._updateState(VALUE);
    this._unfocusStars();

    LABEL.classList.add('focused');

    console.debug('Star rating. Click:', VALUE, VALUE ? 'ok' : 'err', ev);
  }
}

MyStarRatingElement.define(); //, { extends: 'input' });
