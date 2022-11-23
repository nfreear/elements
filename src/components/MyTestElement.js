/**
 * Run the W3C / Nu Html Checker on the serialized DOM, possibly other tests ...?
 *
 * @copyright © Nick Freear, 05-Nov-2022.
 * @see https://codepen.io/nfreear/pen/PoaGGgB
 * @see https://validator.w3.org/nu/about.html
 */

import { MyElement } from '../MyElement.js';

const { fetch, FormData, Node, Request } = window;

const filterStrings = ['tag seen', 'Stray end tag', 'Bad start tag', 'violates nesting rules', 'Duplicate ID', 'first occurrence of ID', 'Unclosed element', 'not allowed as child of element', 'unclosed elements', 'not allowed on element', 'unquoted attribute value', 'Duplicate attribute'];

const TEMPLATE = `
<template>
  <slot></slot>
  <style>
    form { margin: 1rem 0; }
    button { font: inherit; padding: .4rem .75rem; }
    label { margin-right: 1rem; }
  </style>
  <form method="POST" action="https://validator.w3.org/nu/"
    target="_blank" acceptCharset="utf-8" enctype="multipart/form-data">
    <button type="submit">Check me! 💙</button>
    <details>
      <summary>(data)</summary>
      <label>Source? <input name="showsource" value="yes" checked type="checkbox"></label>
      <label>Outline? <input name="showoutline" value="yes" checked type="checkbox"></label>
      <label>JSON? <input name="out" value="json" checked type="checkbox"></label>
      <label>Content <textarea name="content"></textarea></label>
    </details>
  </form>
</template>
`;

export class MyTestElement extends MyElement {
  static getTag () {
    return 'my-test';
  }

  connectedCallback () {
    this.$$ = {};
    this._attachLocalTemplate(TEMPLATE);

    this.$$.form = this.shadowRoot.querySelector('form');

    // FORM.elements.content.value = this._getDocument(document);

    // Facilitate Bootstrap ;).
    this.style.display = 'block';
    this.classList.add('container');

    this.$$.form.addEventListener('submit', ev => this._handleSubmit(ev));

    console.debug('my-test:', this);
  }

  async _run () {
    return await this._handleSubmit();
  }

  get _data () {
    return this.$$;
  }

  async _handleSubmit (ev) {
    if (ev) { ev.preventDefault(); }

    const FORM = ev ? ev.target : this.$$.form;

    FORM.elements.content.value = this._getDocument(document);

    const { data, res, req } = await this._fetchValidatorResult(FORM);

    const { relevant, notRel, filterRE } = this._filterA11yRelevant(data.messages || []);

    this.$$ = { ...this.$$, relevant, notRel, filterRE, data, res, req };

    // console.debug('my-test, RES:', this.$$);

    return this.$$;
  }

  async _fetchValidatorResult (FORM) {
    const formData = new FormData(FORM);
    // formData.append('showoutline', 'yes');
    // formData.append('showimagereport', 'yes');

    const req = new Request(FORM.action, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: formData
    });
    const res = await fetch(req);
    const data = await res.json();

    return { data, res, req };
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

  _filterA11yRelevant (messages) {
    const filterRE = filterStrings.join('|');
    const notRel = [];

    const relevant = messages.filter(it => {
      const isRel = it.message.match(filterRE) !== null;

      if (!isRel) {
        notRel.push(it);
      }
      return isRel;
    });

    return { relevant, notRel, filterRE };
  }
}

MyTestElement.define();
