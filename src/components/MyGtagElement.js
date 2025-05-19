/**
 * Implementation of gtag.js (Google Tag Manager)
 *
 * @customElement my-gtag
 * @demo ../demo/my-analytics.html
 * @see https://www.philschmid.de/how-to-use-google-tag-manager-and-google-analytics-without-cookies
 * @see https://stackoverflow.com/questions/58801416/disabling-cookies-in-google-analytics-gtag-js
 * @see https://webkit.org/blog/9521/intelligent-tracking-prevention-2-3/
 * @see https://developers.google.com/tag-platform/gtagjs/reference
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/config
 */
export class MyGtagElement extends HTMLElement {
  static getTag () { return 'my-gtag'; }

  constructor () {
    super();
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag () {
      window.dataLayer.push(arguments);
    };
    this._setConsentDefaults();
  }

  get _tagId () {
    const _tagId = this.getAttribute('tag-id');
    console.assert(_tagId, 'tag-id - Attribute is required.');
    return _tagId;
  }

  get _delayMs () {
    return parseInt(this.getAttribute('delay-ms') || 500);
  }

  get _storageKey () { return 'ga:clientId'; }

  async _loadGtagScript () {
    return await import(`https://www.googletagmanager.com/gtag/js?id=${this._tagId}`);
  }

  gtag (...arg) {
    window.dataLayer.push(arguments);
  }

  event (eventName = 'test', paramsObj) {
    this.gtag('event', eventName, {
      event_callback: (tid, p) => console.debug('GTM event:', tid, p),
      ...paramsObj
    });
  }

  async connectedCallback () {
    await this._loadGtagScript();

    const clientId = this._storage.getItem(this._storageKey);
    if (!clientId) {
      this._storage.setItem(this._storageKey, await this._uuidv4());
    }

    this.gtag('js', new Date());
    this.gtag('config', this._tagId, {
      send_page_view: true,
      // client_storage: 'none',
      client_id: this._storage.getItem(this._storageKey)
    });

    console.debug('my-gtag:', this._tagId, this);
  }

  get _storage () { return window.localStorage; }

  async _loadUuidv4Script () {
    await import('https://cdn.jsdelivr.net/npm/uuid@latest/dist/umd/uuidv4.min.js');
    // return await import ('https://unpkg.com/uuid@/dist/esm-browser/index.js');
  }

  async _uuidv4 () {
    await this._loadUuidv4Script();
    const { uuidv4 } = window;
    console.debug('uuidv4:', uuidv4);
    return uuidv4();
  }

  /** Prevent use of cookies.
   * @see https://developers.google.com/tag-platform/devguides/consent#set_consent_defaults
   */
  _setConsentDefaults () {
    this.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: this._delayMs
    });
  }
}

export default MyGtagElement;
