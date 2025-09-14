const { HTMLElement, location } = window;

/**
 * Minimalist, privacy-focussed site analytics, built on GoatCounter.
 * No cookies. No tracking of IP address. No external Javascript.
 *
 * @copyright © Nick Freear, 08-April-2023.
 *
 * @customElement my-site-counter
 * @demo https://codepen.io/nfreear/pen/NWOPoXO
 * @see https://www.goatcounter.com/help/pixel
 * @see https://github.com/arp242/goatcounter/blob/master/public/count.js#L54
 * @example <img src="https://MYCODE.goatcounter.com/count?p=/test">
 * @status beta, my blog
 */
export class MySiteCounterElement extends HTMLElement {
  static getTag () { return 'my-site-counter'; }

  /** @return {string} */
  get gcid () {
    const GC_ID = this.getAttribute('gcid');
    if (GC_ID) return GC_ID;
    throw new Error('The "gcid" required attribute is missing.');
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

    const imgElement = this._createPixelImageElement();

    this.attachShadow({ mode: 'open' }).appendChild(imgElement);
  }

  _createPixelImageElement () {
    const IMG = document.createElement('img');

    IMG.src = this._goatCounterImageUrl;
    IMG.alt = ''; // Accessibility: a decorative image.
    IMG.setAttribute('aria-hidden', true);
    IMG.loading = 'eager';
    IMG.onerror = (ev) => {
      const { target } = ev; // error, message - Undefined (cross-origin).
      console.error('my-site-counter ERROR:', this.gcid, IMG.src, target, ev);
    };
    IMG.onload = (ev) => {
      console.debug('my-site-counter OK (GoatCounter):', this.gcid, this._queryParams, this);
    };
    return IMG;
  }

  get _goatCounterImageUrl () {
    const urlParams = new URLSearchParams(this._queryParams);
    return `https://${this.gcid}.goatcounter.com/count?${urlParams.toString()}`;
  }

  get _screenSizeAndScale () {
    const { width, height } = window.screen;
    const SCALE = parseInt(window.devicePixelRatio);

    return `${parseInt(width)},${parseInt(height)},${SCALE}`;
  }

  get _cacheBusting () { return Math.random().toString(36).substr(2, 8); }

  get _queryParams () {
    return {
      p: location.pathname,
      t: document.title || '[none]',
      r: document.referrer || '',
      e: false, // Event.
      q: '', // Query, campaign.
      s: this._screenSizeAndScale,
      rnd: this._cacheBusting
    };
  }
}

export default MySiteCounterElement;
