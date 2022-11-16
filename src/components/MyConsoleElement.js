/**
 * My Console.
 *
 * @copyright © Nick Freear, 16-Nov-2022.
 */

import { MyElement } from '../MyElement.js';

const CONSOLE = window.console;
const SUPPORTED = ['assert', 'debug', 'info', 'error', 'log', 'warn'];

const TEMPLATE = `
<template>
<style>
  .outer { line-height: 1.5; }
  .outer > * { border: 2px solid #ccc; border-radius: .25rem; padding: .5rem; }
  .outer > * > ul { padding-left: 1.2rem; margin: 0; }
  details[ open ] > summary { border-bottom: none; }
  pre { margin: 0; }
  li { border-top: 1px solid #eee; margin: 0; padding-left: .7rem; }
  li::after { content: ' ('attr(data-fn)')'; }
  li:nth-child(even),
  summary { background-color: #f8f8f8; }
  var { color: purple; }
  [ data-fn = debug ],
  [ data-fn = info ] { color: navy; }
  [ data-fn = error ],
  [ data-result = false ] { color: #b00; }
  [ data-result = true ] { color: green; }
  [ data-fn = warn ] { color: darkorange; }
  [ data-fn = error ]::marker,
  [ data-result = false ]::marker { content: '❌'; }
  [ data-result = true  ]::marker { content: '✅'; }
  [ data-fn = warn ]::marker { content: '⚠️'; }
  [ data-fn = info ]::marker { content: 'ℹ️'; }
</style>
<details open class="outer">
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
    this._initialize();
  }

  _initialize () {
    this._saveConsole();
    this._injectConsole();

    // const name = this.getAttribute('name') || 'A name attribute';

    this._attachLocalTemplate(TEMPLATE);
    this._wrapElem = this.shadowRoot.querySelector('[ role = log ] > *');

    console.debug('my-console:', this);
  }

  _saveConsole () {
    this._origConsoleFns = SUPPORTED.map(fn => CONSOLE[fn]);

    console.debug('>> _saveConsole:', this._origConsoleFns);
  }

  _reset () {
    console.debug('>> my-console._reset');
    SUPPORTED.forEach((fn, idx) => {
      // console.debug('>> fn:', fn, this._origConsoleFns[idx]);
      console[fn] = this._origConsoleFns[idx];
    });
  }

  _injectConsole () {
    console.debug('>> my-console._injectConsole!');

    // Save a reference!
    // this._origConsole = window.console;

    console.assert = (assertion, ...args) => this._assert(assertion, ...args);
    // console.debug = (...args) => this._privLog(['debug'], ...args);
    console.info = (...args) => this._privLog(['info'], ...args);
    console.error = (...args) => this._privLog(['error'], ...args);
    console.log = (...args) => this._privLog(['log'], ...args);
    console.warn = (...args) => this._privLog(['warn'], ...args);
  }

  _privLog ([FN, PROPS], ...params) {
    const PREFIX = PROPS ? PROPS.prefix : null;
    const RESULT = PROPS ? PROPS.result : null;
    const EL = document.createElement('li');
    const DATA = [];

    EL.dataset.fn = FN;
    EL.dataset.result = RESULT || '';
    EL.dataset.prefix = PREFIX || '';
    EL.setAttribute('part', 'li');

    if (PREFIX) {
      DATA.push(PREFIX);
    }

    params.forEach(param => {
      switch (typeof param) {
        case 'string':
          DATA.push(`<q>${param}</q>`);
          break;
        case 'boolean':
        case 'number':
          DATA.push(`<var>${param}</var>`);
          break;
        case 'object':
          DATA.push(`<details><summary>obj</summary><pre>${JSON.stringify(param, null, 2)}</pre></details>`);
          break;
        default:
          throw new Error(`Not supported type: ${typeof param}`);
      }
    });

    // Run DOMpurify!
    this._saferHtml(DATA.join(' '), EL);

    this._wrapElem.appendChild(EL);
    // this._origConsole[FN](...params);
  }

  _assert (assertion, ...params) {
    const result = assertion ? 'true' : 'false';
    const prefix = assertion ? 'Assertion passed' : 'Assertion failed';

    this._privLog(['assert', { prefix, result }], ...params);
  }
}

MyConsoleElement.define();
