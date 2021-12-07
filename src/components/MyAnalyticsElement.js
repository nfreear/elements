/**
 * Easily embed Analytics without cookies ~ Yay!
 *
 * @copyright © Nick Freear, 28-June-2021.
 * @see https://gist.github.com/nfreear/0146258d72e9e1330b19a1ff2c143ff6,
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#using_localstorage_to_store_the_client_id,
 */

export class MyAnalyticsElement extends HTMLElement {
  constructor() {
    super();

    const analyticsId = this.getAttribute('analytics-id') || 'UA-123456-XX';
    const debug = this.getAttribute('debug') || false;
    const storageKey = 'ga:clientId';

    this.$$ = { analyticsId, debug, storageKey };

    this.injectScript(debug);
    this.sendPageView(analyticsId, storageKey);
  }

  injectScript(debug) { //: void {
    /* eslint-disable */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      /* @ts-ignore */
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script',`https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`,'ga');
    /* eslint-enable */
  }

  sendPageView(analyticsId, storageKey) { //: void {
    const ga = window.ga; // (window as any).ga;
    // const GAO = window.GoogleAnalyticsObject;

    if (window.localStorage) {
      ga('create', analyticsId, {
        'storage': 'none',
        'clientId': localStorage.getItem(storageKey)
      });
      ga((tracker) /*: void*/ => {
        localStorage.setItem(storageKey, tracker.get('clientId'));
      });
    } else {
      ga('create', analyticsId, 'auto');
    }

    ga('send', 'pageview');

    console.debug('my-analytics (Google) ~ sendPageView:', this.$$, this);
    console.debug('ga (Google):', ga);
  }
}

customElements.define('my-analytics', MyAnalyticsElement);
