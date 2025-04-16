
const { HTMLElement, localStorage } = window;

/**
 * Embed analytics without cookies.
 *
 * Easily embed Google Analytics - use <tt>localStorage</tt> instead of cookies, and anonyise the IP address.
 *
 * @copyright © Nick Freear, 28-June-2021.
 *
 * @demo ../demo/my-analytics.html
 * @see https://gist.github.com/nfreear/0146258d72e9e1330b19a1ff2c143ff6,
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#using_localstorage_to_store_the_client_id,
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs#alternative_async_tag,
 *
 * @customElement my-analytics
 * @class MyAnalyticsElement
 * @status beta, my blog
 * @since 1.0.0
 */
export class MyAnalyticsElement extends HTMLElement {
  static getTag () {
    return 'my-analytics';
  }

  get analyticsId () { return this.getAttribute('analytics-id') || 'UA-123456-XX'; }

  get anonymizeIp () { return this.getAttribute('anonymize-ip') || true; }

  get debug () { return this.getAttribute('debug') || false; }

  get _storageKey () { return 'ga:clientId'; }

  async connectedCallback () {
    this.$$ = { };

    this._asyncGa();
    this._sendPageView();
    this._appendAsyncScript();

    // Was: this._injectScript(debug);
    // Was: this.sendPageView(analyticsId, storageKey);
  }

  // DEPRECATED!
  _injectScript (debug) { // : void {
    /* eslint-disable */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      /* @ts-ignore */
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script',`https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`,'ga');
    /* eslint-enable */
  }

  _appendAsyncScript () {
    const SCR = document.createElement('script');
    SCR.src = `https://www.google-analytics.com/analytics${this.debug ? '_debug' : ''}.js`;
    SCR.async = 'async';
    this.attachShadow({ mode: 'open' }).appendChild(SCR);
  }

  _asyncGa () {
    /* eslint-disable-next-line */
    window.ga = window.ga || function () { (ga.q = ga.q || []).push(arguments); }; ga.l = +new Date();
  }

  _doAnonymizeIp () {
    if (this.anonymizeIp) {
      window.ga('set', 'anonymizeIp', true);
    }
  }

  _sendPageView () {
    const ga = window.ga; // (window as any).ga;

    if (window.localStorage) {
      ga('create', this.analyticsId, {
        storage: 'none',
        clientId: localStorage.getItem(this._storageKey)
      });
      ga((tracker) /*: void */ => {
        localStorage.setItem(this._storageKey, tracker.get('clientId'));
      });
    } else {
      ga('create', this.analyticsId, 'auto');
    }

    this._doAnonymizeIp();

    ga('send', 'pageview');

    console.debug('my-analytics (Google) ~ sendPageView:', this.analyticsId, this);
    console.debug('ga (Google):', ga);
  }
}

export default MyAnalyticsElement;
