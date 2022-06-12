/**
 * A Countdown Timer Widget.
 *
 * @copyright © Nick Freear, 07-May-2022.
 *
 * @see https://geeksforgeeks.org/create-countdown-timer-using-javascript/
 */

import { MyElement } from '../MyElement.js';

const STYLES = `
.countdown { display: inline-block; line-height: 1.6; }
.countdown > * { text-align: center; }
span { background: var(--my-countdown-bg-num, transparent); display: inline-block; margin: 0 1.5%; width: 29%; }
.with-seconds span { width: 22%; }
tx { background: var(--my-countdown-bg-label, transparent); display: block; font-size: 75%; padding: .25rem 0; }
num { display: block; font-size: 200%; min-height: 3rem; padding: .5rem 0; }
footer { font-size: 70%; margin: .6rem 0; }

.red { color: red; }
`;

/* const STYLES = `
.countdown { display: inline-block; }
.countdown > * { text-align: center; }
span { background: #eee; display: inline-block; margin: 0 .2rem; width: 4.2rem; }
tx { background: #ddd; display: block; font-size: small; padding: .25rem 0; }
num { display: block; font-size: 2.2rem; min-height: 3rem; padding: .5rem 0; }
footer { font-size: small; }
`; */

const INTERVAL_MS = 5 * 1000;

export class MyCountdownElement extends MyElement {
  static getTag () {
    return 'my-countdown';
  }

  async connectedCallback () {
    const datetime = this.getAttribute('datetime') || '2022-12-31 23:59:59';
    const showSeconds = this.getAttribute('show-seconds') === 'true';

    const countdown = this._calculate(datetime);
    const ELEM = document.createElement('div');
    const STYLE_EL = document.createElement('style');

    ELEM.innerHTML = this._template(countdown);
    ELEM.classList.add('countdown');
    ELEM.classList.add(`${showSeconds ? 'with' : 'no'}-seconds`);
    STYLE_EL.textContent = STYLES;

    this.attachShadow({ mode: 'open' }).appendChild(STYLE_EL);
    this.shadowRoot.appendChild(ELEM);

    setInterval(() => {
      const CD = this._calculate(datetime);

      ELEM.title = `… and ${CD.seconds} seconds`;
      ELEM.innerHTML = this._template(CD);

      console.debug('.');
    },
    INTERVAL_MS);

    console.debug('my-countdown:', countdown, this);
  }

  _template (countdown) {
    const { days, hours, minutes, seconds, deadline } = countdown;

    return `
    <span class="dd"><num>${days}</num> <tx>days</tx></span>
    <span class="hh"><num>${hours}</num> <tx>hours</tx></span>
    <span class="mm"><num>${minutes}</num> <tx>minutes</tx></span>
    <span class="ss"><num>${seconds}</num> <tx>seconds</tx></span>
    <footer><time datetime="${deadline}"><slot></slot></time></footer>
    `;
  }

  _calculate (deadlineStr) {
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diff = deadline - now;

    if (isNaN(deadline)) {
      throw new Error(`Input not recognized as a date-time: '${deadlineStr}'`);
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, deadline: deadlineStr, diff, expired: diff < 0 };
  }
}

MyCountdownElement.define();
