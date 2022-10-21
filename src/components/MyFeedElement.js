/**
 * Display an RSS, Atom or similar feed.
 *
 * @copyright © Nick Freear, 20-Oct-2022.
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

    const { data, resp, req } = await this._fetchFeed(HREF);

    const ITEMS = data.items.map(el => this._makeListItem(el));

    const listElem = document.createElement('ul'); // Was: 'ol'

    this._saferHtml(ITEMS.join('\n'), listElem);

    this.attachShadow({ mode: 'open' }).appendChild(listElem);

    this.dataset.title = data.feed.title;
    this.dataset.count = data.items.length;

    console.debug('my-feed:', data, resp, req, this);
  }

  _makeListItem (item) {
    const { guid, link, pubDate, title } = item;
    return `<li>
    <a part="a" data-guid="${guid}" href="${link}" title="${pubDate}">${title}</a>
  </li>`;
  }

  async _fetchFeed (href) {
    const uri = this._parseUrl(href);
    const req = new Request(uri);
    const resp = await fetch(req);
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
