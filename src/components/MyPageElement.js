/*!

  NDF, 27-Nov-2021.
*/

import { MyElement } from '../MyElement.js';

export class MyPageElement extends MyElement {
  constructor () {
    super();

    /* const template = document.getElementById('my-page');
    const templateContent = template.content;
    const root = templateContent.cloneNode(true);

    this.attachShadow({mode: 'open'}).appendChild(root); */

    this.getTemplate('my-page');

    console.debug('my-page:', this);
  }
}

customElements.define('my-page', MyPageElement);
