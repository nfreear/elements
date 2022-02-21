/**
 * ATbar
 * A free tool that adds accessibility tools to any website.
 * ATBar enables easy zooming, font changes, recolouring (and more) on almost any website.
 *
 * @version ATbar - Version 2.2.1
 * @version Powered by AtKit v1.6.2 (atkit release channel)
 *
 * @copyright © University of Southampton 2010-2013.
 * @author Sebastian Skuse, Magnus White and the Accessibility Team. Web and Internet Science, ECS.
 * @license "ATbar is available under the BSD open-source Licence."
 *
 * @see https://www.atbar.org/
 * @see https://access.ecs.soton.ac.uk/projects/atbar
 * @see https://github.com/AccessAtECS/ATBar
 * @see https://bitbucket.org/accessatecs/atbar/
 * @see https://web.archive.org/web/20180430085017/https://fixtheweb.net/
 * @see https://twitter.com/FixTheWeb
 * @see https://youtu.be/8Ik_LHmZx8Y
 */

import { MyElement } from '../MyElement.js';

export class MyAtbarButtonElement extends MyElement {
  static getTag () {
    return 'my-atbar-button';
  }

  async connectedCallback () {
    // const position = this.getAttribute('position') || 'top'; // top or inline.

    await this.getTemplate('my-atbar-button');

    console.debug('my-atbar-button:', this);
  }
}

MyAtbarButtonElement.define();
