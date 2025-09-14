/**
 * Custom site search.
 *
 * @copyright © Nick Freear, 17-Mar-2022.
 * @customElement my-search
 * @demo ../demo/my-search.html
 * @see https://cse.google.com/cse/all
 * @see https://developers.google.com/custom-search/docs/element
 * @status my blog
 */
export class MySearchElement extends window.HTMLElement {
  static getTag () { return 'my-search'; }

  get cx () {
    const CX = this.getAttribute('cx'); // || '001222343498871500969:-u73i2qfu2s';
    console.assert(CX, '"cx" - Required attribute');
    return CX || undefined;
  }

  get label () { return this.getAttribute('label') || 'Search'; }

  connectedCallback () {
    const ELEMS = this.#createElements();

    this.#addConfig();

    this.appendChild(ELEMS.label);
    this.appendChild(ELEMS.search);
    this.appendChild(this.#scriptElem());

    console.debug('my-search:', this.cx, this);
  }

  #createElements () {
    const search = document.createElement('div'); // const id = '___gcse_0';
    const label = document.createElement('label');

    search.classList.add('gcse-search');
    // search.dataset.enableAutoComplete = true; ??
    search.dataset.mobileLayout = 'forced';

    label.textContent = this.label;
    label.setAttribute('for', 'gsc-i-id1');

    return { search, label };
  }

  #scriptElem () {
    const GCSE = document.createElement('script');
    GCSE.async = true;
    GCSE.src = `https://cse.google.com/cse.js?cx=${this.cx}`;

    // var s = document.getElementsByTagName('script')[0];
    // s.parentNode.insertBefore(gcse, s);
    return GCSE;
  }

  #addConfig () {
    window.__gcse = {
      parsetags: 'onload', // Not: 'explicit', // Defaults to 'onload'
      initializationCallback: () => console.debug('CSE init.'),
      searchCallbacks: {
        image: {
          /* starting: myImageSearchStartingCallback,
          ready: myImageResultsReadyCallback,
          rendered: myImageResultsRenderedCallback, */
        },
        web: {
          starting: (N, q) => console.debug('CSE start:', N, q),
          ready: (R) => console.debug('CSE ready:', R),
          rendered: (R) => console.debug('CSE rendered:', R)
        }
      }
    };
  }
}

export default MySearchElement;
