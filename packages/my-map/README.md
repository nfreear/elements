
[![Node.js CI][ci-img]][ci]
[![NPM package][npm-img]][npm]
[![Leaflet 1.9.4][leaflet-img]][leaflet]

# my-map #

Easily embed a map powered by [Leaflet][]. Includes [accessibility][myp] and [translation][myp] Leaflet plugins.

* [nfreear.github.io/elements/demo][demo]
* Demo on [CodePen][]

## Usage

Available on the [Unpkg][] CDN:

```html
<script src="https://unpkg.com/@nfreear/my-map@1" type="module"></script>

<my-map
  latlng="51.505,-0.09"
  zoom="13"
  geojson="./data/landmarks.geo.json"
>
  <marker latlng="51.505, -0.09" hidden>Hello, I'm a popup!</marker>

  <p> My map description ... </p>
</my-map>
```

<!--
```
<custom-element-demo>
<template>
  <script src="https://unpkg.com/@nfreear/my-map@1" type="module"></script>

  <my-map latlng="51.505,-0.09" zoom="13">
    <marker latlng="51.505, -0.09" hidden>Hello, I'm a popup!</marker>

    <p> My map description ... </p>
  </my-map>
</template>
</custom-element-demo>
```
-->


## License

* License: [MIT][].

[ci]: https://github.com/nfreear/elements/actions/workflows/node.js.yml
[ci-img]: https://github.com/nfreear/elements/actions/workflows/node.js.yml/badge.svg
[leaflet-img]: https://img.shields.io/badge/leaflet-1.9.4-green.svg?style=flat
[codepen]: https://codepen.io/nfreear/pen/KKeJKov
[demo]: https://nfreear.github.io/elements/demo/
[mit]: https://github.com/nfreear/elements/blob/main/LICENSE.txt
[npm]: https://www.npmjs.com/package/@nfreear/my-map
[npm-img]: https://img.shields.io/npm/v/%40nfreear/my-map
[unpkg]: https://unpkg.com
  "A fast, global content delivery network for everything on npm"
[up-cdn]: https://unpkg.com/@nfreear/my-map@1/index.js
[skypack]: https://cdn.skypack.dev
  "A JavaScript Delivery Network for modern web apps"
[leaflet]: https://leafletjs.com/
[myp]: https://github.com/nfreear/leaflet.plugins
  "A collection of accessibility and localisation/ translation plugins for Leaflet"
