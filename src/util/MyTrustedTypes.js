/**
 * Implement Trusted Types.
 *
 * @see https://github.com/w3c/trusted-types
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TrustedHTML
 * @see https://www.squash.io/how-to-regex-regex-not-match/
 */
export class MyTrustedTypes {
  #promise = null;
  #polyfillLoaded = false;
  #ttRef = null;
  #policies = [];

  get isSupported () { return 'trustedTypes' in window; }
  get isPolyfill () { return this.#polyfillLoaded; }
  get TT () { return this.#ttRef; }

  get #RE () {
    return {
      lessThan: /</g,
      allTags: /</g,
      allowAnchorLink: /<(?!a href=|\/a>)/ig,
      notAnchorLink: /<(?!a href=|\/a>)/ig,
      javascriptColon: /javascript:/ig,
      onEvent: /on(\w+)[ ]*=/ig,
    };
  }

  get #replace () {
    return {
      lessThanEntity: '&lt;',
      cleanJavascriptColon: '#_ZZ-scrip:',
      cleanOnEvent: '>on$1=', // 'on-ZZ-$1='
    };
  }

  createHTML (id, str) {
    const found = this.#policies.find((it) => id === it.id);
    console.assert(found, `Expecting a policy with id: ${id}`);
    return found.policy.createHTML(str);
  }

  /**
   * @return Promise(this)
   */
  load () {
    return this.#importPolyfillIfNeeded().then((trustedTypes) => {
      console.assert(trustedTypes, 'Expecting trustedTypes');

      this.#policies.push({
        id: 'allowAnchor',
        policy: trustedTypes.createPolicy('myEscapePolicy', {
        // createHTML: (string) => string.replace(/</g, "&lt;"),
        /* createHTML: (str) => str.replace(/on(\w+)=/ig, 'on-ZZ-$1=')
                                .replace(/<(\/?)(script|object|embed|i?frame|style)/ig, '&lt;$1$2')
                                .replace(/javascript:/ig, 'ZZ-scrip:'), */

          createHTML: (str) => str.replace(this.#RE.allowAnchorLink, this.#replace.lessThanEntity)
          // .replace(/<([^a][^ ]|\/[^a])/ig, '&lt;$1') // /<(?!(a|b) )/ig
          // .replace(/<\/([^a])/ig, '&lt;/$1')
            .replace(this.#RE.javascriptColon, this.#replace.cleanJavascriptColon)
            .replace(this.#RE.onEvent, this.#replace.cleanOnEvent)
        })
      }); // push.

      return this;
    }); // then.
  }

  get #polyfillJs () {
    return 'https://unpkg.com/trusted-types@2.0.0/dist/es6/trustedtypes.api_only.build.js';
  }

  #importPolyfillIfNeeded () {
    this.#promise = new Promise((resolve, reject) => {
      if (this.isSupported) {
        this.#ttRef = window.trustedTypes;
        resolve(this.TT);
        console.debug('No TT polyfill required:', this.TT);
      } else {
        import(this.#polyfillJs).then(() => {
          this.#polyfillLoaded = true;
          this.#ttRef = window.trustedTypes;
          resolve(this.TT);
          console.log('Trusted Types Polyfill loaded:', this.TT);
        })
          .catch((err) => {
            console.assert(err instanceof TypeError, 'Expecting a TypeError');
            reject(err);
          });
      }
    });
    return this.#promise;
  }
}

export default MyTrustedTypes;

/* const mTT = new MyTrustedTypes()
mTT.load().then((obj) => {
  console.debug('MTT obj:', obj);
}); */
