
[![Node.js CI][ci-img]][ci]
[![NPM package][npm-img]][npm]
[![Published on Webcomponents.org][wc-img]][wc]
[![Leaflet 1.9.4][leaflet-img]][leaflet]

# `<my-map>` #

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
  <marker latlng="51.505, -0.09" title="I'm a marker">Hi, I'm a popup!</marker>

  <p> My map description ... </p>
</my-map>
```

```html
<script src="https://cdn.skypack.dev/@nfreear/my-map@1?min" type="module"></script>

...
```

## Attributes

The attributes that can be set on a `<my-map>` HTML element:

| Attribute    | Default  | Description                                       |
|--------------|----------|---------------------------------------------------|
| `latlng`     |`51.47,-0.005`|Geographic centre of the map (latitude, longitude)|
| `zoom`       | `13`   | Initial map zoom level                              |
| `geojson`    | `null` | The URL of a [GeoJSON][] file                       |
| `tile-url`   | (OSM)  | URL template for a tile provider, e.g. OpenStreetMap|
| `api-key`    | `null` | API key for the tile provider                       |
| `attribution`| (OSM)  | Attribution text                                    |
|`marker-selector`|`[latlng]`|CSS selector to use to query for child marker elements|

To add copyright links to the `attribution` attribute, use the following short-codes:

* `{MB}`  — [MapBox](https://www.mapbox.com),
* `{MT}`  — [MapTiler](https://www.maptiler.com/copyright/),
* `{NLS}` — [National Library of Scotland](https://maps.nls.uk/projects/api/),
* `{OSM}` — [OpenStreetMap](https://www.openstreetmap.org/copyright),
* `{OSC}`  — [Ordnance Survey (Crown &copy;)][oslegal] ([OS API][]),
* `{TF}`  — [ThunderForest](https://www.thunderforest.com/),

## License

* License: [MIT][].

[ci]: https://github.com/nfreear/elements/actions/workflows/node.js.yml
[ci-img]: https://github.com/nfreear/elements/actions/workflows/node.js.yml/badge.svg
[wc]: https://www.webcomponents.org/element/@nfreear/my-map
[wc-img]: https://img.shields.io/badge/webcomponents.org-published-blue.svg
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
[geojson]: https://geojson.org/
[oslegal]: https://osdatahub.os.uk/legal/overview
[os api]: https://osdatahub.os.uk/docs/wmts/technicalSpecification
