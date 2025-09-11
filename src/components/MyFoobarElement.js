import attachTemplate from '../util/attachTemplate.js';

/**
 * Boilerplate template.
 *
 * @copyright © Nick Freear, 09-Dec-2021.
 *
 * @class MyFoobarElement
 * @customElement my-foobar
 * @property {tagName} &lt;my-foobar> - Create a my-foobar element.
 * @status beta
 * @since 1.0.0
 */
export class MyFoobarElement extends HTMLElement {
  static getTag () {
    return 'my-foobar';
  }

  get #htmlTemplate () {
    return `
    <template>Hello world!</template>
    `;
  }

  /* constructor () { // "Useless constructor"!
    super();
  } */

  async connectedCallback () {
    // const name = this.getAttribute('name') || 'A name attribute';

    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);
    // Was: await this.getTemplate('my-foobar');

    console.debug('my-foobar:', this);
  }
}

// Was: MyFoobarElement.define();
// Was: customElements.define('my-foobar', MyFoobarElement);
