
const { HTMLElement } = window;

/**
 * Listen for a DOM or CustomEvent event, and update a live-region with data.
 *
 * @customElement my-live-bridge
 * @demo https://nfreear.github.io/elements/demo/my-live-bridge.html
 * @see https://codepen.io/nfreear/pen/XJWVRPK
 * @see https://codepen.io/nfreear/pen/QwWOdWN
 * @copyright © Nick Freear, 15-Mar-2025.
 * @status beta
 * @since 1.7.0
 */
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
    console.assert(this.liveRegion, `A live region element is required. Selector: ${this.selector}`);

    this.addEventListener(this.event, (ev) => this._eventHandler(ev));

    console.debug('my-live-bridge', [this]);
  }

  _eventHandler (ev) {
    this.liveRegion.textContent = this._formatMessage(ev);

    // Optional animation.
    this.liveRegion.dataset.myLiveBridgeAnimate = true;
    this.liveRegion.dataset.myLiveBridge = true;
    setTimeout(() => {
      this.liveRegion.dataset.myLiveBridgeAnimate = false;
    },
    this.timeout);

    console.debug(this.event, ev);
  }

  _isCustomEvent (ev) {
    return ev.type.match(/.+:.+/);
  }

  _replacements (ev) {
    return [
      { pattern: '{value}', replace: ev.target.value },
      { pattern: '{text}', replace: ev.target.textContent },
      { pattern: '{event}', replace: ev.type }, // Debugging?
      { // Support 'data-*' attributes.
        pattern: /\{dataset\.(\w+)\}/,
        replace: (str, match) => ev.target.dataset[match] || null
      }, {
        pattern: /\{detail\.(\w+)\}/,
        replace: (str, match) => this._isCustomEvent(ev) ? ev.detail[match] : null
      }
    ];
  }

  _formatMessage (ev) {
    let message = this.message;

    this._replacements(ev).forEach(({ pattern, replace }) => {
      message = message.replace(pattern, replace);
    });
    return message;
  }
}

export default MyLiveBridgeElement;
