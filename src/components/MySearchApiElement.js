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
  #response;

  get #searchId () { return this.getAttribute('search-id'); }
  // https://developers.google.com/custom-search/v1/introduction#identify_your_application_to_google_with_api_key
  get #apiKey () { return this.getAttribute('key'); }
  get #buttonText () { return this.getAttribute('button-text') ?? 'Search'; }

  #searchUrl (query) {
    const encq = encodeURIComponent(query);
    return `https://customsearch.googleapis.com/customsearch/v1?key=${this.#apiKey}&cx=${this.#searchId}&q=${encq}`;
  }

  #assertRequired () {
    console.assert(this.#searchId, 'search-id is required');
    console.assert(this.#apiKey, 'api-key is required');
    console.assert(this.#buttonText, 'button-text is required');
  }

  connectedCallback () {
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

    const query = ev.target.elements.query.value;

    const { items } = await this.#fetchResults(query);
    const elems = items.map((it) => this.#createListItem(it));

    elems.forEach((el) => { this.#resultElem.appendChild(el); });

    this.dataset.loading = false;
  }

  async #fetchResults (query) {
    const resp = this.#response = await fetch(this.#searchUrl(query));
    this.dataset.query = query;
    this.dataset.httpStatus = resp.status;

    if (!resp.ok) {
      console.error('Fetch Error:', resp.status, resp.url, resp); // 400 Bad Request.
      return { items: [], resp };
    }
    this.#data = await resp.json();
    const { context, items, kind, queries, searchInformation } = this.#data;

    console.debug('Fetch OK:', context, items, kind, queries, searchInformation, resp, [this]);

    this.dataset.count = items.length;

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
    const form = document.createElement('form');
    const results = document.createElement('ul');
    const labelElem = document.createElement('label');
    const inputElem = document.createElement('input');
    const outputElem = document.createElement('output');
    const buttonElem = document.createElement('button');
    const buttonTextElem = document.createElement('span');
    const slotElem = document.createElement('slot');

    form.appendChild(labelElem);
    form.appendChild(inputElem);
    form.appendChild(buttonElem);
    form.appendChild(outputElem);

    buttonElem.appendChild(buttonTextElem);
    labelElem.appendChild(slotElem);

    slotElem.textContent = 'Search';
    buttonTextElem.textContent = this.#buttonText;

    buttonElem.setAttribute('aria-label', this.#buttonText);

    labelElem.setAttribute('part', 'label');
    inputElem.setAttribute('part', 'input');
    buttonElem.setAttribute('part', 'button');
    buttonTextElem.setAttribute('part', 'buttonText');
    outputElem.setAttribute('part', 'output');
    results.setAttribute('part', 'ul results');

    labelElem.setAttribute('for', 'q');
    inputElem.id = 'q';
    inputElem.type = 'search';
    inputElem.name = 'query';
    outputElem.name = 'output';

    inputElem.setAttribute('required', '');
    inputElem.setAttribute('minlength', 2);
    inputElem.setAttribute('maxlength', 40);

    return { form, results };
  }
}

export default MySearchApiElement;
