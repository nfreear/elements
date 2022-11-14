/**
 * Run the W3C / Nu Html Checker on the serialized DOM, possibly other tests ...?
 *
 * @copyright © Nick Freear, 05-Nov-2022.
 * @see https://codepen.io/nfreear/pen/PoaGGgB
 * @see https://validator.w3.org/nu/about.html
 */

import { MyElement } from '../MyElement.js';

const { Node } = window;

const TEMPLATE = `
<template>
  <slot></slot>
  <style>
    form { margin: 1rem 0; }
    button { font: inherit; padding: .4rem .75rem; }
  </style>
  <form method="POST" action="https://validator.w3.org/nu/"
    target="_blank" acceptCharset="utf-8" enctype="multipart/form-data">
    <button type="submit">Check me! 💙</button>
    <details>
      <summary>(data)</summary>
      <input name="showsource" value="yes"/>
      <textarea name="content"></textarea>
    </details>
  </form>
</template>
`;

export class MyTestElement extends MyElement {
  static getTag () {
    return 'my-test';
  }

  connectedCallback () {
    // .
    this._attachLocalTemplate(TEMPLATE);

    const FORM = this.shadowRoot.querySelector('form');

    FORM.elements.content.value = this._getDocument(document);

    // Facilitate Bootstrap ;).
    this.style.display = 'block';
    this.classList.add('container');

    console.debug('my-test:', this);
  }

  _getDocument (elem) {
    /* eslint-disable-next-line */ // let doc;
    for (var doc = '', elem = elem.firstChild; elem;) {
      switch (elem.nodeType) {
        case Node.ELEMENT_NODE:
          doc += elem.outerHTML;
          break;
        case Node.TEXT_NODE:
          doc += elem.nodeValue;
          break;
        case Node.CDATA_SECTION_NODE:
          doc += '<![CDATA[' + elem.nodeValue + ']]>';
          break;
        case Node.COMMENT_NODE:
          doc += '<!--' + elem.nodeValue + '-->';
          break;
        case Node.DOCUMENT_TYPE_NODE:
          doc += '<!DOCTYPE ' + elem.name + '>\n';
          break;
      }
      elem = elem.nextSibling;
    }
    return doc;
  }
}

MyTestElement.define();
