/**
 * MyMathElement
 * - Powered by MathJax - "Beautiful and accessible math in all browsers".
 *
 * @copyright © Nick Freear, 10-May-2023.
 * @see https://www.mathjax.org/
 * @status beta
 * @since 1.0.0
 */

import MyElement from '../MyElement.js';

export class MyMathElement extends MyElement {
  static getTag () {
    return 'my-math';
  }

  /** @see https://npmjs.com/package/mathjax
   */
  get mathJaxJs () {
    return 'https://unpkg.com/mathjax@3.2.2/es5/tex-mml-chtml.js';
    // was 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  }

  get fontURL () {
    // return 'https://unpkg.com/mathjax@3.2.2/es5/output/chtml/fonts/woff-v2'; // No trailing slash!
    return 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2'; // No trailing slash!
  }

  async connectedCallback () {
    this._setConfig(this.fontURL);

    await import(this.mathJaxJs);
  }

  /**
  * https://docs.mathjax.org/en/latest/options/output/chtml.html#chtml-options
  */
  _setConfig (fontURL) {
    window.MathJax = {
      chtml: {
        scale: 1, // global scaling factor for all expressions
        matchFontHeight: true, // true to match ex-height of surrounding font
        fontURL
      },
      startup: {
        ready: () => this._ready()
      }
    };
  }

  _ready () {
    const { MathJax } = window;
    console.debug('MathJax is loaded, but not yet initialized.');
    MathJax.startup.defaultReady();
    MathJax.startup.promise.then(() => {
      console.debug('MathJax initial typesetting complete.', this);
    });
  }
}
