/**
 * Redirect <tt>console.log()</tt>, etc. to the page.
 *
 * Supports <tt>assert</tt>, info, error, log and <tt>warn</tt> methods.
 *
 * @copyright © Nick Freear, 16-Nov-2022.
 *
 * @demo https://codepen.io/nfreear/pen/PoaEpVa
 * @customElement my-console
 * @status experimental, for demos, Codepen
 * @since 1.3.0
 */

import { MyElement } from '../MyElement.js';

const CONSOLE = window.console;
const ALL = ['assert', 'debug', 'info', 'error', 'log', 'warn'];
const SUPPORTED = ['assert', /* 'debug', */ 'info', 'error', 'log', 'warn'];

const TEMPLATE = `
<template>
<style>
  .outer { line-height: 1.6; }
  .outer > * { border: 2px solid rgba(127,127,127, .5); border-radius: .25rem; padding: .5rem; }
  .outer > * > ul { padding-left: 1.2rem; margin: 0; }
  details[ open ] > summary { border-bottom: none; }
  pre { margin: 0; }
  li { border-top: 1px solid rgba(127,127,127, .1); margin: 0; padding-left: .7rem; }
  .outer details { line-height: 1; }
  li::after { content: ' ('attr(data-fn)')'; }
  li:nth-child(even),
  summary { background-color: rgba(127,127,127, .05); }
  var { color: purple; }
  [ data-fn = debug ],
  [ data-fn = info ] { color: navy; }
  [ data-fn = error ],
  [ data-result = fail ] { color: #b00; }
  [ data-result = pass ] { color: green; }
  [ data-fn = warn ] { color: darkorange; }
  [ data-fn = error ]::marker,
  [ data-result = fail ]::marker { content: '❌'; }
  [ data-result = pass ]::marker { content: '✅'; }
  [ data-fn = warn ]::marker { content: '⚠️'; }
  [ data-fn = info ]::marker { content: 'ℹ️'; }
</style>
<details class="outer">
  <summary id="label"><slot>my-console</my-slot></summary>
  <div role="log" aria-labelledby="label"><ul></ul></div>
</details>
</template>
`;

export class MyConsoleElement extends MyElement {
  static getTag () {
    return 'my-console';
  }

  constructor () {
    super();
    this.$$ = { saved: false, logCount: 0, asserts: { pass: 0, fail: 0 } };
    this._initialize();
  }

  _initialize () {
    this._saveConsole();
    this._injectConsole();
    this._attachLocalTemplate(TEMPLATE);

    this.$$.wrapElem = this.shadowRoot.querySelector('[ role = log ] > *');
    this.$$.outerElem = this.shadowRoot.querySelector('.outer');

    this.classList.add('container');

    if (this.getAttribute('open')) {
      this.$$.outerElem.setAttribute('open', true);
    }

    console.debug('my-console:', this);
  }

  _saveConsole () {
    if (this.$$.saved) return;

    this.$$.saved = true;

    const ORIG = {};
    ALL.forEach(fn => { ORIG[fn] = CONSOLE[fn]; });

    this.$$.origConsoleFns = ORIG;

    console.debug('>> my-console._saveConsole():', this._original);
  }

  get _original () {
    return this.$$.origConsoleFns;
  }

  get _console () {
    return this.$$.newConsoleFns;
  }

  _reset () {
    console.debug('>> my-console._reset()', this._original);

    SUPPORTED.forEach((fn, idx) => {
      console[fn] = this._original[fn];
    });
  }

  _injectConsole () {
    console.debug('>> my-console._injectConsole()');

    const newConsole = {
      assert: (assertion, ...args) => this._assert(assertion, ...args),
      debug: (...args) => this._privLog(['debug'], ...args),
      info: (...args) => this._privLog(['info'], ...args),
      error: (...args) => this._privLog(['error'], ...args),
      log: (...args) => this._privLog(['log'], ...args),
      warn: (...args) => this._privLog(['warn'], ...args)
    };

    this.$$.newConsoleFns = newConsole;

    SUPPORTED.forEach((fn, idx) => {
      console[fn] = newConsole[fn];
    });
  }

  _privLog ([FN, PROPS], ...params) {
    this.$$.logCount++;

    const PREFIX = PROPS ? PROPS.prefix : null;
    const RESULT = PROPS ? PROPS.result : null;
    const EL = document.createElement('li');
    const ITEMS = [];

    EL.dataset.fn = FN;
    // EL.dataset.result = RESULT || '';
    EL.setAttribute('part', `li ${FN} ${RESULT || ''} ${this._evenOdd}`);

    if (PREFIX) {
      EL.dataset.prefix = PREFIX;
      ITEMS.push(PREFIX);
    }

    if (RESULT) { EL.dataset.result = RESULT; }

    // Loop through parameters.
    [...params].forEach(param => this._eachParam(ITEMS, param));

    // Run DOMpurify!
    this._saferHtml(ITEMS.join(' '), EL);

    this.$$.wrapElem.appendChild(EL);

    this._original[FN](...params);
  }

  _eachParam (DATA, param) {
    const TYPE = toType(param);

    switch (TYPE) { // Was: (typeof param)
      case 'string':
        DATA.push(`<q>${param}</q>`);
        break;
      case 'null':
      case 'boolean':
      case 'number':
        DATA.push(`<var>${param}</var>`);
        break;
      case 'array':
      case 'object':
        DATA.push(`<details><summary>obj</summary><pre>${JSON.stringify(param, null, 2)}</pre></details>`);
        break;
      case 'error':
        DATA.push(param.name);
        DATA.push(`<q>${param.message}</q>`);
        break;
      default:
        this._original.error(new Error(`Not a supported type: ${TYPE}`));
        // throw new Error(`Not a supported type: ${typeof param}`);
    }
  }

  _assert (assertion, ...params) {
    const result = assertion ? 'pass' : 'fail';
    const prefix = assertion ? 'Assertion passed' : 'Assertion failed';

    if (assertion) {
      this.$$.asserts.pass++;
    } else {
      this.$$.asserts.fail++;
    }

    this._privLog(['assert', { prefix, result }], ...params);
  }

  _logTotals () {
    const { fail, pass } = this.$$.asserts;
    const TOTALS = `Tests:  <i data-result=pass>${pass} passed</i>, ${pass + fail} total.`;
    this._privLog(['log', { result: 'totals' }], TOTALS);
  }

  get _evenOdd () {
    return this.$$.logCount % 2 === 0 ? 'even' : 'odd';
  }
}

// Was: MyConsoleElement.define();

/**
 * @author Angus Croll.
 * @source https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
 */
function toType (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

// End.
