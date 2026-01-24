const { fetch, HTMLElement } = window;

/**
 * Programmable Search Engine
 *
 * @see https://developers.google.com/custom-search/v1/overview#
 * @see https://programmablesearchengine.google.com/controlpanel/all
 * @customElement my-search-api
 */
export class MySearchApiElement extends HTMLElement {
  static getTag () { return 'my-search-api'; }

  #form;
  #resultElem;
  #data;
  #priv = {};
  #response;

  get #searchId () { return this.getAttribute('search-id'); }

  // https://developers.google.com/custom-search/v1/introduction#identify_your_application_to_google_with_api_key
  #getApiKey () {
    this.#priv.apiKey = this.getAttribute('key');
    this.setAttribute('key', '');
  }

  get #buttonText () { return this.getAttribute('button-text') ?? 'Search'; }
  get #resultTemplate () { return this.getAttribute('result-template') ?? '%s results found'; }

  get #query () { return this.#form.elements.query.value; }
  get #encQuery () { return encodeURIComponent(this.#query); }

  get #searchUrl () {
    return `https://customsearch.googleapis.com/customsearch/v1?key=${this.#priv.apiKey}&cx=${this.#searchId}&q=${this.#encQuery}`;
  }

  get #resultItems () { return this.#data.items ?? []; }
  get #count () { return this.#resultItems.length; }

  #assertRequired () {
    console.assert(this.#searchId, 'search-id is required');
    console.assert(this.#priv.apiKey, 'api-key is required');
    console.assert(this.#buttonText, 'button-text is required');
  }

  connectedCallback () {
    this.#getApiKey();
    this.#assertRequired();
    const root = this.attachShadow({ mode: 'open' });

    // const ctr = document.querySelector('#searchID');

    const { form, results } = this.#createElements();
    this.#form = form;
    this.#resultElem = results;

    root.appendChild(form);
    root.appendChild(results);

    this.#form.addEventListener('submit', async (ev) => this.#submitHandler(ev));

    console.debug('search-api', [this]);
  }

  async #submitHandler (ev) {
    this.dataset.loading = true;
    ev.preventDefault();

    await this.#fetchResults();
    const elems = this.#resultItems.map((it) => this.#createListItem(it));

    elems.forEach((el) => { this.#resultElem.appendChild(el); });

    this.#markResults();
    this.#summarizeResults();

    this.dataset.loading = false;
  }

  #summarizeResults () {
    this.#form.elements.output.value = this.#resultTemplate.replace('%s', this.#count);
    this.dataset.count = this.#count;
  }

  async #fetchResults () {
    const resp = this.#response = await fetch(this.#searchUrl);
    this.dataset.query = this.#query;
    this.dataset.httpStatus = resp.status;

    if (!resp.ok) {
      console.error('Search Fetch Error:', resp.status, resp.url, resp); // 400 Bad Request.
      return { items: [], resp };
    }
    this.#data = await resp.json();
    const { context, items, kind, queries, searchInformation } = this.#data;

    console.debug('Search Fetch OK:', context, items, kind, queries, searchInformation, resp, [this]);

    return { context, items, kind, queries, searchInformation, resp };
  }

  #createListItem (it) {
    const { link, htmlSnippet, htmlTitle } = it;
    // Was: const { link, snippet, title, htmlSnippet, htmlTitle, pagemap }
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    const para = document.createElement('p');

    anchor.setAttribute('part', 'a');
    anchor.href = link;
    // anchor.textContent = title;
    anchor.innerHTML = htmlTitle;
    para.innerHTML = htmlSnippet;
    para.setAttribute('part', 'p');
    li.setAttribute('part', 'li');
    li.appendChild(anchor);
    li.appendChild(para);

    return li;
  }

  #createElements () {
    const form = this.#createElement('form', false);
    const results = this.#createElement('ul', 'ul results');
    const labelElem = this.#createElement('label', -1, [['for', 'q']]);
    const inputElem = this.#createElement('input', -1, [['id', 'q'], ['type', 'search'], ['name', 'query'], ['required', '']]);
    const outputElem = this.#createElement('output', -1, [['name', 'output']]);
    const buttonElem = this.#createElement('button');
    const buttonTextElem = this.#createElement('span', 'buttonText');
    const slotElem = this.#createElement('slot', false);

    form.appendChild(labelElem);
    form.appendChild(inputElem);
    form.appendChild(buttonElem);
    form.appendChild(outputElem);

    buttonElem.appendChild(buttonTextElem);
    labelElem.appendChild(slotElem);

    slotElem.textContent = 'Search';
    buttonTextElem.textContent = this.#buttonText;

    buttonElem.setAttribute('aria-label', this.#buttonText);
    inputElem.setAttribute('minlength', 2);
    inputElem.setAttribute('maxlength', 40);

    return { form, results };
  }

  #createElement (tagName, partAttr, attributes = []) {
    const elem = document.createElement(tagName);
    const part = typeof partAttr === 'undefined' || partAttr === -1 ? tagName : partAttr;
    if (partAttr !== false) {
      elem.setAttribute('part', part);
    }
    attributes.forEach(([attr, value]) => { elem.setAttribute(attr, value); });
    return elem;
  }

  #markResults () {
    const boldElems = this.shadowRoot.querySelectorAll('b');
    boldElems.forEach((el) => { el.setAttribute('part', 'mark'); });
  }
}

export default MySearchApiElement;
