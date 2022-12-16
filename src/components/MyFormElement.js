/**
 * <form is="my-form">
 *
 * @copyright © Nick Freear, 19-Oct-2022.
 */

const { customElements, HTMLFormElement } = window;

export class MyFormElement extends HTMLFormElement {
  static getTag () {
    return 'my-form';
  }

  static async define (name = null, options = { extends: 'form' }) {
    // await whenDOMReady();
    const klass = this;
    const NAME = name || klass.getTag();

    customElements.define(NAME, klass, options);
  }

  async connectedCallback () {
    this._onsubmit = async (ev) => console.debug('Submit:', this._formData, ev);

    console.debug('my-form:', this);
  }

  set _onsubmit (callbackFn) { /* eslint-disable-line accessor-pairs -- setWithoutGet */
    const delayMs = parseInt(this.dataset.delay) || 1000;

    this.addEventListener('submit', async (ev) => {
      this.dataset.submitted = true;
      ev.preventDefault();
      this._disableFormFields();
      callbackFn && await callbackFn(ev);
      setTimeout(() => this._enableFormFields(), delayMs);
    });
  }

  /** Get data from the form elements.
  */
  get _formData () {
    const DATA = {};
    this._names.forEach(name => { DATA[name] = this.elements[name].value; });
    return DATA;
  }

  /** Put data in the form elements.
  */
  set _formData (data) {
    // console.debug('form data set:', data);
    this._names.forEach(name => { this.elements[name].value = data[name] || ''; });
  }

  get _names () {
    const nameElems = this.querySelectorAll('[ name ]');
    return [...nameElems].map(el => el.name);
  }

  get _allFields () {
    return [...this.querySelectorAll('button,input,textarea,select,fieldset')];
  }

  _disableFormFields () {
    this._allFields.forEach(el => el.setAttribute('disabled', 'disabled'));
  }

  _enableFormFields () {
    this._allFields.forEach(el => el.removeAttribute('disabled'));
  }
}

MyFormElement.define();
