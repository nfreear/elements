
[![Node.js CI][ci-img]][ci]
[![NPM package][npm-img]][npm]

# My Web Components #

A collection of experimental Web Components, NOT yet open sourced!

* [nfreear.github.io/web-components/demo][demo]

## Rationale ##

* Experimental, particularly `<my-page>`, `<my-nav>` which are probably not for production !!
* Should be usable without a build system, minimalist,
* Accessible and usable for end-users - use WAI-ARIA where appropriate!
* Simple for developers to try out,
* ES6 classes in JS files, with associated HTML + CSS in `<template>` in `.tpl.html` files,
* Self-contained where possible - SVG icons embedded in `<template>`, except `<my-map>` (Leaflet.js)
* Use shadow DOM where possible - see notes on forms (below?)
* A playground, plus some components that I will use in my blog etc.
* Demo page, per component (almost?!),
* `semistandard` linting, etc.

About [Web Components][mdn].

## Usage

```html
<my-skip-link></my-skip-link>


<my-options template-host="github.io"></my-options>

<script src="https://nfreear.github.io/web-components/index.js"
  type="module" async crossorigin
></script>
```

## License

* License [MIT][]

[ci]: https://github.com/nfreear/web-components/actions/workflows/node.js.yml
[ci-img]: https://github.com/nfreear/web-components/actions/workflows/node.js.yml/badge.svg
[demo]: https://nfreear.github.io/web-components/demo/
[mit]: https://nfreear.mit-license.org/#2021
[npm]: https://www.npmjs.com/package/ndf-web-components
[npm-img]: https://img.shields.io/npm/v/ndf-web-components
[mdn]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
