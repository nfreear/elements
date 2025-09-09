import { appendTemplate, safeUrl, strip } from '../util/attachTemplate.js';
// Was: import MyElement from '../MyElement.js';

const { fetch, HTMLElement, Request, location } = window;

/**
 * Display an RSS, Atom or similar feed.
 *
 * @copyright © Nick Freear, 20-Oct-2022.
 *
 * @customElement my-feed
 * @demo ../demo/my-feed.html
 * @see https://codepen.io/nfreear/pen/rNKwoNL
 * @status beta, my blog
 * @since 1.3.0
 */
export class MyFeedElement extends HTMLElement {
  static getTag () { return 'my-feed'; }

  get href () {
    const HREF = this.getAttribute('href');
    if (HREF) { return HREF; }
    throw new Error('"href" is a required attribute.');
  }

  get include () { return this.getAttribute('include'); }

  get isOpen () { return this.getAttribute('details') === 'open'; }

  get toJson () {
    if (this.hasAttribute('to-json')) { return true; }

    // Legacy!
    const BASE = location.href;
    const PARSED = new URL(this.href, BASE);
    return PARSED.protocol === 'tojson:';
  }

  get #rssToJsonService () {
    return 'https://api.rss2json.com/v1/api.json?rss_url=';
  }

  get #defaultRss () {
    return 'tojson:http://feeds.bbci.co.uk/news/rss.xml';
  }

  async connectedCallback () {
    const { data, resp, req } = await this.#fetchFeed();

    const FILTERED = this.#filterItems(data.items);

    const itemTemplates = FILTERED.map(el => this.#makeListItem(el, this.isOpen));

    const listElem = document.createElement('ul'); // Was: 'ol'

    itemTemplates.forEach((it) => appendTemplate(it).to.element(listElem));
    // Was: this._saferHtml(ITEMS.join('\n'), listElem);

    this.attachShadow({ mode: 'open' }).appendChild(listElem);

    this.dataset.title = data.feed ? data.feed.title : '';
    this.dataset.time = data.feed ? data.feed.time : '';
    this.dataset.count = data.items.length;

    console.debug('my-feed:', data, resp, req, this);
  }

  get #includeRegex () {
    const INCLUDE = this.include ? this.include.split(/,[ ]*/) : null;
    return INCLUDE ? new RegExp(`(${INCLUDE.join('|')})`, 'i') : null;
  }

  #filterItems (items) {
    const filtered = this.include
      ? items.filter(it => {
        return it && it.tags && it.tags.some(tag => this.#includeRegex.test(tag));
      })
      : items;

    console.debug('my-feed ~ Filtered:', this.include, filtered);

    return filtered;
  }

  #makeListItem (item, open) {
    const { skip, guid, link, pubDate, title, url, time, tags, content, content_html } = item; /* eslint-disable-line camelcase */

    if (skip) return '<template><!-- skip --></template>';

    // @TODO: security! - _saferHtml()
    const CONTENT = content || content_html || null; /* eslint-disable-line camelcase */
    const DETAILS = CONTENT ? `<details part="details" ${open ? 'open' : ''}><summary part="summary">More</summary>${CONTENT}</details>` : null;
    // Be liberal in what we accept - 'link' or 'url'.
    // console.debug('makeListItem:', item);
    return `<template>
    <li>
    <a part="a" data-tags="${tags ? tags.join(',') : ''}" data-guid="${strip(guid || '')}"
       href="${safeUrl(link || url)}" title="${strip(pubDate || time || '')}">${strip(title)}</a>
    ${DETAILS || '&nbsp;'}
  </li>
  </template>`;
  }

  async #fetchFeed () {
    const req = this.#createRequest();
    const resp = await fetch(req);
    if (!resp.ok) {
      throw new Error(`MyFeedElement (fetch): ${resp.status} ~ ${resp.url}`);
    }
    const data = await resp.json();

    return { data, resp, req };
  }

  // Was: _parseUrl();
  #createRequest () {
    const PARSED = new URL(this.href.replace(/^tojson:/, ''), location.href);

    const feedUrl = this.toJson ? this.#rssToJsonService + encodeURIComponent(PARSED.href) : PARSED.href;
    return new Request(feedUrl);
  }
}
