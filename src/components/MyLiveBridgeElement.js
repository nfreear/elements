/**
 * Listen for a bubbling event, and update a live-region with data.
 *
 * @see https://codepen.io/nfreear/pen/QwWOdWN
 * @copyright © Nick Freear, 15-Mar-2025.
 * @status beta
 * @since 1.7.0
 */

const { HTMLElement } = window;

export class MyLiveBridgeElement extends HTMLElement {
  static getTag () {
    return 'my-live-bridge';
  }

  get event () {
    return this.getAttribute('event');
  }

  get message () {
    return this.getAttribute('message');
  }

  get timeout () {
    return parseInt(this.getAttribute('timeout') || 1000);
  }

  get selector () {
    return this.getAttribute('selector') || '[live-region], [role=status], [role=alert], output';
  }

  get liveRegion () {
    return this.querySelector(this.selector);
  }

  connectedCallback () {
    console.assert(this.event, '"event" - attribute required');
    console.assert(this.message, '"message" - attribute required.');
    console.assert(this.liveRegion, 'Live region required.');

    this.addEventListener(this.event, (ev) => this._eventHandler(ev));

    console.debug('my-live-bridge', [this]);
  }

  _eventHandler (ev) {
    this.liveRegion.textContent = this._getMessage(ev);

    // Optional animation.
    this.liveRegion.dataset.myLiveBridge = true;
    setTimeout(() => {
      this.liveRegion.dataset.myLiveBridge = false;
    },
    this.timeout);

    console.debug(this.event, ev);
  }

  _getMessage (ev) {
    return this.message.replace('{value}', ev.target.value);
  }
}
