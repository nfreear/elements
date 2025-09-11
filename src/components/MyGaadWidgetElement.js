import attachTemplate from '../util/attachTemplate.js';

const { HTMLElement, location } = window;

/**
 * A Global Accessibility Awareness Day banner.
 *
 * @copyright gaad-widget.js | © 2019 Nick Freear | License: MIT.
 * @copyright © Nick Freear, 05-May-2022.
 * @customElement my-gaad-widget
 *
 * @TODO ~ Monitor hard-coded date-text in template!
 * @see https://github.com/nfreear/gaad-widget/blob/3.x/data/gaad.json
 */
export class MyGaadWidgetElement extends HTMLElement {
  static getTag () { return 'my-gaad-widget'; }

  // Simple test for the month of May!
  get #isMay () { return new Date().getMonth() === 4; }

  get #forceUrl () { return /gaad=force/.test(location.search); }

  get #year () { return new Date().getFullYear(); }

  get #styleUrl () { return 'https://nfreear.github.io/elements/src/style/my-gaad-widget.css'; }
  get #gaadUrl () { return 'https://accessibility.day/?utm_source=github&utm_campaign=gaad-widget'; }
  get #icalUrl () { return 'https://unpkg.com/gaad-widget@^3/data/gaad.en.ics'; }

  connectedCallback () {
    if (this.#shouldShow) {
      attachTemplate(this.#htmlTemplate).to.shadowDOM(this);
      // this._attachLocalTemplate(this._template);
      this.#setDataYear();
    }

    console.debug('my-gaad-widget:', this.#shouldShow, this);
  }

  get #shouldShow () { return this.#isMay || this.#forceUrl; }

  #setDataYear () {
    const ELEM = this.shadowRoot.querySelector('.gaad-widget-js');
    ELEM.dataset.year = this.#year;
  }

  get #htmlTemplate () {
    // <style>${this._stylesheet}</style>
    return `
<template>
  <link rel="stylesheet" href="${this.#styleUrl}">
  <div
    part="div"
    lang="en" dir="ltr"
    class="gaad-widget-js put-hide"
    >
  Join us on Thursday May

  <i class="tx y2025" >15th, 2025 and mark the 14th</i>
  <i class="tx y2026" hidden>21st, 2026 and mark the 15th</i>
  <i class="tx y2027" hidden>20th, 2027 and mark the 16th</i>
  <i class="tx y2028" hidden>18th, 2028 and mark the 17th</i>
  <i class="tx y2029" hidden>17th, 2029 and mark the 18th</i>
  <i class="tx y2030" hidden>16th, 2030 and mark the 19th</i>

  <a part="a" href="${this.#gaadUrl}" target="_top">Global Accessibility Awareness Day (GAAD)</a>.
  <div class="w">
    <a class="p" href="https://github.com/nfreear/gaad-widget#usage" aria-label="Put gaad-widget on your web site (v3.4.0)" target="_top">↓</a>
    <a class="c" part="ical" href="${this.#icalUrl}" aria-label="Download an iCal calendar file" title="Download an iCal calendar file"
    >📆</a>
  </div>
  </div>
</template>
`;
  }
}

export default MyGaadWidgetElement;
