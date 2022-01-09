/**
  Add a "Fork me on GitHub" ribbon.

  © Nick Freear, 09-Dec-2021.

  @see http://simonwhitaker.github.io/github-fork-ribbon-css/
*/

import { MyElement } from '../MyElement.js';

export class MyForkMeElement extends MyElement {
  static getTag () {
    return 'my-fork-me';
  }

  constructor () {
    super();

    const HREF = this.getAttribute('href') || 'https://github.com/#!my/repo';

    this._initialize(HREF);
  }

  async _initialize (href) {
    await this.getTemplate('my-fork-me');

    const LINK = this.shadowRoot.querySelector('a');

    LINK.href = href;

    console.debug('my-fork-me:', href, this);
  }
}

MyForkMeElement.define();
