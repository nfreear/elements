/**
 * Minimalist, privacy-focussed site analytics, built on GoatCounter.
 * No cookies. No tracking of IP address. No external Javascript.
 *
 * @copyright © Nick Freear, 08-April-2023.
 *
 * @see https://codepen.io/nfreear/pen/NWOPoXO
 * @see https://www.goatcounter.com/help/pixel
 * @see https://github.com/arp242/goatcounter/blob/master/public/count.js#L54
 * @example <img src="https://MYCODE.goatcounter.com/count?p=/test">
 */

import MyElement from '../MyElement.js';

const { location } = window;

export class MySiteCounterElement extends MyElement {
  static getTag () {
    return 'my-site-counter';
  }

  get gcid () {
    const GC_ID = this.getAttribute('gcid');
    if (GC_ID) return GC_ID;
    throw new Error('The "gcid" attribute is missing.');
  }

  get _guardLocalhost () {
    if (this.getAttribute('allow-localhost')) return true;
    if (location.hostname === 'localhost') return false;

    return true;
  }

  get _guardMyself () {
    return location.hash !== '#toggle-goatcounter';
  }

  connectedCallback () {
    if (!this._guardMyself) {
      return console.debug('my-site-counter:', 'Not counting myself!');
    }
    if (!this._guardLocalhost) {
      return console.debug('my-site-counter:', 'Not counting localhost');
    }

    const PARAM = this._getQueryParams();

    const SP = new URLSearchParams(PARAM);
    const IMG = document.createElement('img');

    IMG.src = this._goatCounterImageUrl(this.gcid, SP.toString());
    IMG.alt = ''; // Accessibility: a decorative image.
    IMG.loading = 'eager';
    IMG.onerror = (ev) => {
      const { target } = ev; // error, message - Undefined (cross-origin).
      console.error('my-site-counter ERROR:', this.gcid, IMG.src, target, ev);
    };
    IMG.onload = (ev) => {
      console.debug('my-site-counter OK (GoatCounter):', this.gcid, PARAM, this);
    };

    this.attachShadow({ mode: 'open' }).appendChild(IMG);
  }

  _goatCounterImageUrl (gcId, query) {
    return `https://${gcId}.goatcounter.com/count?${query}`;
  }

  _getQueryParams () {
    const { width, height } = window.screen;
    const SCALE = parseInt(window.devicePixelRatio);

    return {
      p: location.pathname,
      t: document.title || '[none]',
      r: document.referrer || '',
      e: false, // Event.
      q: '', // Query, campaign.
      s: `${parseInt(width)},${parseInt(height)},${SCALE}`,
      rnd: Math.random().toString(36).substr(2, 8) // Cache-busting.
    };
  }
}
