/**
 * Display an RSS, Atom or similar feed.
 *
 * @copyright © Nick Freear, 20-Oct-2022.
 *
 * @see https://codepen.io/nfreear/pen/rNKwoNL
 * @see ../demo/my-feed.html
 * @status beta, my blog
 * @since 1.3.0
 */

import MyElement from '../MyElement.js';

const { fetch, Request } = window;

const RSS_TO_JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';
const DEFAULT_RSS = 'tojson:http://feeds.bbci.co.uk/news/rss.xml';

export class MyFeedElement extends MyElement {
  static getTag () {
    return 'my-feed';
  }

  async connectedCallback () {
    const HREF = this.getAttribute('href') || DEFAULT_RSS;
    const INCLUDE = this.getAttribute('include');

    const { data, resp, req } = await this._fetchFeed(HREF);

    const FILTERED = this._filterItems(data.items, INCLUDE);

    const ITEMS = FILTERED.map(el => this._makeListItem(el));

    const listElem = document.createElement('ul'); // Was: 'ol'

    this._saferHtml(ITEMS.join('\n'), listElem);

    this.attachShadow({ mode: 'open' }).appendChild(listElem);

    this.dataset.title = data.feed ? data.feed.title : '';
    this.dataset.time = data.feed ? data.feed.time : '';
    this.dataset.count = data.items.length;

    console.debug('my-feed:', data, resp, req, this);
  }

  _filterItems (items, include) {
    const INCLUDE = include ? include.split(/,[ ]*/) : null;
    const REGEX = INCLUDE ? new RegExp(`(${INCLUDE.join('|')})`, 'i') : null;

    const filtered = INCLUDE
      ? items.filter(it => {
        return it && it.tags && it.tags.some(tag => REGEX.test(tag));
      })
      : items;

    console.debug('my-feed ~ Filtered:', INCLUDE, filtered);

    return filtered;
  }

  _makeListItem (item) {
    const { guid, link, pubDate, title, url, time, tags } = item;
    // Be liberal in what we accept - 'link' or 'url'.
    return `<li>
    <a part="a" data-tags="${tags ? tags.join(',') : ''}" data-guid="${guid || ''}"
       href="${link || url}" title="${pubDate || time}">${title}</a>
  </li>`;
  }

  async _fetchFeed (href) {
    const uri = this._parseUrl(href);
    const req = new Request(uri);
    const resp = await fetch(req);
    if (!resp.ok) {
      throw new Error(`MyFeedElement (fetch): ${resp.status} ~ ${uri}`);
    }
    const data = await resp.json();

    return { data, resp, req };
  }

  _parseUrl (href) {
    const PARSED = new URL(href);

    if (PARSED.protocol === 'tojson:') {
      return RSS_TO_JSON + encodeURIComponent(PARSED.pathname);
    }
    return PARSED.href;
  }
}

MyFeedElement.define();
