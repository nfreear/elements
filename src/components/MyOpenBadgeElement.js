import attachTemplate from '../util/attachTemplate.js';

const { fetch, HTMLElement, Request } = window;

/**
 * @customElement my-open-badge
 * @demo
 * @see https://codepen.io/nfreear/pen/Qwjpbpx
 * @see https://www.credly.com/badges/cfc2c32c-6d52-4278-8444-ce87e8aabd5b
 */
export class MyOpenBadgeElement extends HTMLElement {
  #ok = false;
  #badgeData = {};

  static getTag () { return 'my-open-badge'; }

  get imageSize () { return parseInt(this.getAttribute('image-size') || 10); }

  get hasBorder () { return this.hasAttribute('border'); }

  get #anchorSelector () { return 'a[ href *= "credly.com" ]'; }

  get #urlRegex () { return /https:\/\/www.credly.com\/badges\/([0-9a-f-]{34,40})/; }

  get assertionId () {
    const ELEM = this.querySelector(this.#anchorSelector);
    console.assert(ELEM, 'Credly.com badge link inside <my-open-badge> element not found.');
    const M = ELEM.href.match(this.#urlRegex);
    console.assert(M, `Credly.com badge link does not match expected pattern: ${ELEM.href}`);
    return M ? M[1] : null;
  }

  get #apiUrl () { return `https://api.credly.com/v1/public_badges/${this.assertionId}`; }

  get #corsProxyUrl () {
    return `https://whateverorigin.org/get?url=${encodeURIComponent(this.#apiUrl)}`;
    // return `https://api.allorigins.win/get?url=${encodeURIComponent(this.#apiUrl)}`;
  }

  #createRequest () {
    return new Request(this.#corsProxyUrl, {
      // credentials: 'omit',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json'
      }
    });
  }

  async #fetchBadgeData () {
    const response = await fetch(this.#createRequest());
    console.assert(response.ok, `HTTP error fetching Credly badge data: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      /* eslint-disable camelcase */
      const { http_code, content_type } = data.status;
      console.assert(/application\/json.*/.test(content_type), 'Expecting JSON');
      const badgeData = JSON.parse(data.contents);
      this.#badgeData = badgeData.data;
      if (http_code !== 200) {
        const { message } = badgeData.data;
        throw new Error(`HTTP error (2) - Status: ${http_code}; ${message}`);
      }
      /* eslint-enable */
      this.#ok = true;
    }
  }

  async connectedCallback () {
    try {
      await this.#fetchBadgeData();
    } catch (ex) {
      console.error('Fetch Error.', ex);
      this.dataset.ready = false;
      this.dataset.error = ex;
    }
    attachTemplate(this.#ok ? this.#htmlTemplate : this.#errorTemplate).to.shadowDOM(this);
    this.#applyBorderStyle();

    console.debug('my-open-badge:', this.#ok, this.#badgeData);
  }

  #applyBorderStyle () {
    if (this.hasBorder) {
      this.style.border = '1px solid silver';
      this.style.borderRadius = '.5rem';
      this.style.display = 'block';
      this.style.padding = '.5rem';
    }
  }

  get #htmlTemplate () {
    /* eslint-disable camelcase */
    const { badge_template, expires_at_date, image_url, issued_at_date, issued_to, id } = this.#badgeData;
    const { description, name, issuer, global_activity_url, skills } = badge_template;
    this.dataset.assertionId = id;
    this.dataset.expiresDate = expires_at_date;
    this.dataset.skillsCount = skills.length;
    this.dataset.ready = true;
    return `
  <template>
  <details part="details">
  <summary part="summary">
    <img part="img" alt="${name}" title="${name}" src="${image_url}" style="max-height:${this.imageSize}rem;">
  </summary>
  <div part="div">
    <h2 part="h2 name">${name}</h2>
    <p part="p issuer">${issuer.summary.replace('issued by', '')}</p>
    <p part="p date at">Issued on: <time>${issued_at_date}</time>
      <span part="span date exp">· Expires on: <time>${expires_at_date}</time></span>
    </p>
    <p part="p to" hidden>Issued to: ${issued_to}</p>
    <p part="p desc" X_hidden>${description}</p>
    <a part="a learn" href="${global_activity_url}">Learn more</a>
    ·
    <a part="a badge" href="https://www.credly.com/badges/${id}">View badge on Credly</a>
  </div>
  </details>
  </template>`;
    /* eslint-enable */
  }

  get #errorTemplate () {
    setTimeout(() => {
      const outputElem = this.shadowRoot.querySelector('output');
      outputElem.value = 'Error fetching badge data.';
    }, 250);
    return `<template>
    <slot></slot>
    <p><output part="error output"></output></p>
  </template>`;
  }
}

export default MyOpenBadgeElement;
