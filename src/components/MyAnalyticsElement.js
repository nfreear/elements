/**
 * Easily embed Analytics without cookies - Yay!
 *
 * @copyright © Nick Freear, 28-June-2021.
 *
 * @see ../demo/my-analytics.html
 * @see https://gist.github.com/nfreear/0146258d72e9e1330b19a1ff2c143ff6,
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#using_localstorage_to_store_the_client_id,
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs#alternative_async_tag,
 *
 * @status beta, my blog
 * @since 1.0.0
 */

import { MyElement } from '../MyElement.js';

const { localStorage } = window;

export class MyAnalyticsElement extends MyElement {
  static getTag () {
    return 'my-analytics';
  }

  async connectedCallback () {
    const analyticsId = this.getAttribute('analytics-id') || 'UA-123456-XX';
    const anonymizeIp = this.getAttribute('anonymize-ip') || true;
    const debug = this.getAttribute('debug') || false;
    const storageKey = 'ga:clientId';

    this.$$ = { analyticsId, anonymizeIp, debug, storageKey };

    this.asyncGa();
    this.sendPageView(analyticsId, storageKey);
    this.appendAsyncScript(debug);

    // Was: this.injectScript(debug);
    // Was: this.sendPageView(analyticsId, storageKey);
  }

  // DEPRECATED!
  injectScript (debug) { // : void {
    /* eslint-disable */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      /* @ts-ignore */
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script',`https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`,'ga');
    /* eslint-enable */
  }

  appendAsyncScript (debug) {
    const SCR = document.createElement('script');
    SCR.src = `https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`;
    SCR.async = 'async';
    this.attachShadow({ mode: 'open' }).appendChild(SCR);
  }

  asyncGa () {
    /* eslint-disable-next-line */
    window.ga = window.ga || function () { (ga.q = ga.q || []).push(arguments); }; ga.l = +new Date();
  }

  anonymizeIp () {
    if (this.$$.anonymizeIp) {
      window.ga('set', 'anonymizeIp', true);
    }
  }

  sendPageView (analyticsId, storageKey) { // : void {
    const ga = window.ga; // (window as any).ga;

    if (window.localStorage) {
      ga('create', analyticsId, {
        storage: 'none',
        clientId: localStorage.getItem(storageKey)
      });
      ga((tracker) /*: void */ => {
        localStorage.setItem(storageKey, tracker.get('clientId'));
      });
    } else {
      ga('create', analyticsId, 'auto');
    }

    this.anonymizeIp();

    ga('send', 'pageview');

    console.debug('my-analytics (Google) ~ sendPageView:', this.$$, this);
    console.debug('ga (Google):', ga);
  }
}

MyAnalyticsElement.define();
