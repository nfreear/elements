
[![Node.js CI][ci-img]][ci]
[![NPM package][npm-img]][npm]

# My Elements #

A collection of useful custom elements (Web Components).

* [nfreear.github.io/elements/demo][demo]
* [codepen.io/collection/mrpzOQ][pen]

## Rationale ##

* Some experimental, particularly `<my-page>`, `<my-nav>` which are probably not for production !!
* Should be usable with or without a build system, minimalist,
* Accessible and usable for end-users - use WAI-ARIA where appropriate!
* Simple for developers to try out,
* ES6 classes in JS files (with associated HTML + CSS in `<template>` in `.tpl.html` files - DEPRECATED),
* Self-contained where possible - SVG icons embedded in `<template>`, except `<my-map>` (Leaflet.js)
* Use shadow DOM where possible - see notes on forms (below?)
* A playground, plus some components that I will use in my blog etc.
* Demo page, per component (almost?!),
* `semistandard` linting, etc.

About [Web Components][mdn].

See also: [web-vitals-element][].

## Usage

Available on [Unpkg][] and [Skypack][] CDNs. Note, templates can't currently be accessed from Skypack.

```html
<my-skip-link></my-skip-link>


<my-options template-host="unpkg.com"></my-options>

<script src="https://cdn.skypack.dev/ndf-elements?min"
  type="module" async crossorigin
></script>
```

## Custom import

Dynamically import just the custom elements you want, using an `importmap`.

HTML:
```html
<my-live-bridge event="click" message="Hello world!">
  <p aria-live="polite"></p>

  <p><button>Click me!</button></p>
</my-live-bridge>

<script type="importmap">
{
  "imports": {
    "my-elements": "https://unpkg.com/ndf-elements@^1/i.js"
  },
  "myElements": {
    "use": [ "my-live-bridge", "my-dev-warning" ]
  }
}
</script>

<script type="module"> import 'my-elements'; </script>
```

## Legacy custom import

Dynamically import just the custom elements you want.
```js
import customImport from 'https://unpkg.com/ndf-elements@^1/custom.js';

const MOD = await customImport('my-star-rating, my-skip-link');
```

Then:

```html
<my-skip-link></my-skip-link>

<my-star-rating></my-star-rating>
```

## License

* License: [MIT][].

[ci]: https://github.com/nfreear/elements/actions/workflows/node.js.yml
[ci-img]: https://github.com/nfreear/elements/actions/workflows/node.js.yml/badge.svg
[demo]: https://nfreear.github.io/elements/demo/
[pen]: https://codepen.io/collection/mrpzOQ
[mit]: https://nfreear.mit-license.org/#2021
[npm]: https://www.npmjs.com/package/ndf-elements
[npm-img]: https://img.shields.io/npm/v/ndf-elements
[unpkg]: https://unpkg.com
  "A fast, global content delivery network for everything on npm"
[up-cdn]: https://unpkg.com/ndf-elements@1.1.0/index.js
[skypack]: https://cdn.skypack.dev
  "A JavaScript Delivery Network for modern web apps"
[sp-cdn]: https://cdn.skypack.dev/ndf-elements
[mdn]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[web-vitals-element]: https://github.com/stefanjudis/web-vitals-element
