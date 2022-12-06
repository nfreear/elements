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
    a, label { margin-right: .5rem; }
    textarea { width: 8rem; }
    [ name = out ] { width: 2rem; }
  </style>
  <form method="POST" action="https://validator.w3.org/nu/"
    target="_blank" acceptCharset="utf-8" enctype="multipart/form-data">
    <button type="submit">Check HTML! 💙</button>
    <details>
      <summary>(data)</summary>
      <a href="https://validator.w3.org/nu/about.html">Validator</a>
      <label>Source <input name="showsource" value="yes" checked type="checkbox"></label>
      <label>Outline <input name="showoutline" value="yes" checked type="checkbox"></label>
      <label>Output <input name="out" value="html"></label>
      <label>Content <textarea name="content"></textarea></label>
    </details>
  </form>
</template>
`;

export class MyTestElement extends MyElement {
  static getTag () {
    return 'my-test';
  }

  async connectedCallback () {
    // Doesn't work!
    const autoRun = this.getAttribute('auto-run') === 'true';

    this.$$ = { autoRun };

    this._attachLocalTemplate(TEMPLATE);

    this.$$.form = this.shadowRoot.querySelector('form');

    this.$$.form.elements.content.value = this._getDocument(document);

    // Facilitate Bootstrap ;).
    this.style.display = 'block';
    this.classList.add('container');

    // this.$$.form.addEventListener('submit', ev => this._handleSubmit(ev));

    if (autoRun) {
      await this._run();
    }

    console.debug('my-test:', this.$$, this);
  }

  async _run (form) {
    const { data, res, req } = await this._fetchValidatorResult(form || this.$$.form);

    const { accRelevant, accNotRel, filter } = this._filterAccessibilityRelevant(data.messages || []);

    this.$$.result = { accRelevant, accNotRel, all: data, filter, res, req };

    // console.debug('my-test, run:', this.$$);

    return this.$$.result;
  }

  get _result () {
    return this.$$.result;
  }

  async _handleSubmit (ev) {
    if (ev) { ev.preventDefault(); }

    const FORM = ev ? ev.target : this.$$.form;

    FORM.elements.content.value = this._getDocument(document);

    return await this._run(FORM);
  }

  async _fetchValidatorResult (FORM) {
    const formData = new FormData(FORM);

    formData.set('out', 'json');
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

  _filterAccessibilityRelevant (messages) {
    const filterRE = filterStrings.join('|');
    const accNotRel = [];

    const accRelevant = messages.filter(it => {
      const isRel = it.message.match(filterRE) !== null;

      if (!isRel) {
        accNotRel.push(it);
      }
      return isRel;
    });

    return { accRelevant, accNotRel, filter: filterStrings };
  }
}

MyTestElement.define();
