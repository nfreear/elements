import attachTemplate from '../util/attachTemplate.js';

const { fetch, FormData, Node, Request, HTMLElement } = window;

/**
 * Run the W3C / Nu Html Checker on the serialized DOM.
 * Possibly other tests ...?
 *
 * @copyright © Nick Freear, 05-Nov-2022.
 * @customElement my-test
 * @demo https://codepen.io/nfreear/pen/PoaGGgB
 * @see https://validator.w3.org/nu/about.html
 * @status experimental, for demos, Codepen
 * @since 1.3.0
 */
export class MyTestElement extends HTMLElement {
  #validatorUrl = 'https://validator.w3.org/nu/';
  #result = {};

  static getTag () {
    return 'my-test';
  }

  get #autoRun () { return this.hasAttribute('auto-run'); }

  get #filterStrings () {
    return ['tag seen', 'Stray end tag', 'Bad start tag', 'violates nesting rules', 'Duplicate ID', 'first occurrence of ID', 'Unclosed element', 'not allowed as child of element', 'unclosed elements', 'not allowed on element', 'unquoted attribute value', 'Duplicate attribute'];
  }

  get #filterRegex () { return new RegExp(this.#filterStrings.join('|')); }

  get #form () { return this.shadowRoot.querySelector('form'); }
  get #elements () { return this.#form.elements; }

  async connectedCallback () {
    // Doesn't work!
    // const autoRun = this.getAttribute('auto-run') === 'true';

    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);
    // this._attachLocalTemplate(TEMPLATE);

    this.#elements.content.value = this.#getDocument(document);

    // console.debug('Document:', this.#elements.content.value);

    // Facilitate Bootstrap ;).
    // this.style.display = 'block';
    // this.classList.add('container');

    // this.#form.addEventListener('submit', ev => this.#handleSubmit(ev));

    if (this.#autoRun) {
      await this._run();
    }

    console.debug('my-test:', this.#autoRun, [this]);
  }

  async _run (form) {
    const { data, res, req } = await this.#fetchValidatorResult(form || this.#form);

    const { accRelevant, accNotRelevant } = this.#filterAccessibilityRelevant(data.messages || []);

    this.#result = { accRelevant, accNotRelevant, all: data, res, req };

    // console.debug('my-test, run:', this.$$);

    return this.#result;
  }

  get _result () {
    return this.#result;
  }

  async #handleSubmit (ev) {
    if (ev) { ev.preventDefault(); }

    const FORM = ev ? ev.target : this.$$.form;

    FORM.elements.content.value = this.#getDocument(document);

    return await this._run(FORM);
  }

  async #fetchValidatorResult (FORM) {
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

  #getDocument (elem) {
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

  #filterAccessibilityRelevant (messages) {
    const accNotRelevant = [];

    const accRelevant = messages.filter(it => {
      const isRelevant = this.#filterRegex.test(it.message);
      // const isRel = it.message.match(this.#filterRegex) !== null;

      if (!isRelevant) {
        accNotRelevant.push(it);
      }
      return isRelevant;
    });

    return { accRelevant, accNotRelevant };
  }

  get #htmlTemplate () {
    return `
  <template>
    <slot></slot>
    <style>${this.#stylesheet}</style>
    <form part="form" method="POST" action="${this.#validatorUrl}"
      target="_blank" acceptCharset="utf-8" enctype="multipart/form-data">
      <button part="button" type="submit">Check HTML!</button>
      <details part="details">
        <summary part="summary">(data)</summary>
        <a part="a" href="https://validator.w3.org/nu/about.html">Validator</a>
        <label>Source <input name="showsource" value="yes" checked type="checkbox"></label>
        <label>Outline <input name="showoutline" value="yes" checked type="checkbox"></label>
        <label>Output <input name="out" value="html"></label>
        <label>Content <textarea name="content" part="textarea"></textarea></label>
      </details>
    </form>
  </template>`;
  }

  get #stylesheet () {
    return `
  form { margin: 1rem 0; }
  .X_button { font: inherit; padding: .4rem .75rem; }
  button::after {
    content: '💙';
    margin-left: .25rem;
  }
  a, label { margin-right: .5rem; }
  textarea { width: 8rem; }
  [ name = out ] { width: 2rem; }
    `;
  }
}

export default MyTestElement;
