/**
 * A code playground / live editor.
 *
 * @copyright © Nick Freear, 30-May-2022.
 * @customElement my-live-editor
 * @demo ../demo/my-live-editor.html
 */

import { MyElement } from '../MyElement.js';

export class MyLiveEditorElement extends MyElement {
  static getTag () {
    return 'my-live-editor';
  }

  async connectedCallback () {
    // const name = this.getAttribute('name') || 'A name attribute';

    await this.getTemplate('my-live-editor');

    const EDITOR = this.shadowRoot.querySelector('.editor-pane');
    const LIVE = this.shadowRoot.querySelector('.live-pane');
    const LABEL = this.shadowRoot.querySelector('#ed-label');

    LABEL.addEventListener('click', () => EDITOR.focus());

    EDITOR.innerText = this.innerHTML; // EDITOR.textContent.replace(/</g, '&lt;');
    LIVE.innerHTML = this.innerHTML;

    EDITOR.addEventListener('input', ev => {
      // console.debug('Editor input:', ev);
      console.debug('.');

      LIVE.innerHTML = ev.target.innerText;
    });

    EDITOR.setAttribute('contenteditable', 'true');

    window.ROOT = LIVE;

    console.debug('my-live-editor:', this.innerHTML, this);
  }
}
