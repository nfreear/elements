/*!

  NDF, 27-Nov-2021.
*/

import { MyElement } from '../MyElement.js';

export class MyPageElement extends MyElement {
  static getTag () {
    return 'my-page';
  }

  constructor () {
    super();

    /* const template = document.getElementById('my-page');
    const templateContent = template.content;
    const root = templateContent.cloneNode(true);

    this.attachShadow({mode: 'open'}).appendChild(root); */

    this.getTemplate('my-page').then(() => this.fixUnstyledFlash());

    console.debug('my-page:', this);
  }

  /**
   * Fix Unstyled Flash of Content (FOUC).
   *
   * @see ../../demo/style/app.css
   * @see https://stackoverflow.com/questions/62683430/how-to-stop-fouc-from-happening-with-native-web-components
   */
  fixUnstyledFlash () {
    setTimeout(() => {
      const html = document.querySelector('html');

      html.classList.add('fouc');
      html.classList.add('end');

      // html.style.opacity = 1;
      // html.style.transition = 'opacity 2s ease 0.25s';
    },
    10);
  }
}

MyPageElement.define();
