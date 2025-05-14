import MyElement from '../MyElement.js';

const { fetch } = window;

/**
 * Easily embed a map
 *
 * powered by Leaflet.js - optionally with a GeoJSON feed.
 * Contains accessibility fixes and enhancements.
 *
 * @copyright © Nick Freear, 27-Nov-2021.
 * @customElement my-map
 * @demo https://nfreear.github.io/elements/demo/my-map.html
 * @see https://codepen.io/nfreear/pen/KKeJKov
 * @see https://leafletjs.com/
 *
 * @status beta
 * @since 1.0.0
 */
export class MyMapElement extends MyElement {
  static getTag () { return 'my-map'; }

  get _leafletCdnLibs () {
    return [
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      'https://unpkg.com/leaflet-i18n@0.3.3/Leaflet.i18n.js',
      'https://unpkg.com/leaflet.translate@0.6.0/Leaflet.translate.js',
      'https://unpkg.com/leaflet.a11y@0.6.0/Leaflet.a11y.js'
    ];
  }

  get _leafletStylesheet () {
    return {
      href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    };
  }

  get _defaults () {
    return {
      // Greenwich Observatory, London, UK. (Was: Central London 51.505,-0.09)
      lat: 51.476852,
      long: -0.000500,
      zoom: 13, // Was 14
      // See: github:Leaflet/Leaflet/pull/8418 (Was: 'https://{s}.tile.op..')
      osmTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    };
  }

  get _styles () {
    return `
.map-desc {
  color: #333;
  font: 1rem sans-serif;
  max-width: 35rem;
  margin: 0 auto;
  padding: 0 .2rem;
}
#my-map {
  border: 1px solid #ddd;
  border-radius: .2rem;
  height: 82vh; /* Was: 78 vh */
  max-height: 100%; /* Was: 540px */
  min-height: 180px;
}
.my-loading {
  font-size: 1.3rem;
  margin: 1.3rem;
}
.leaflet-marker-icon {
  border: 1px solid var(--marker-color, navy);
  border-radius: 5px;
}
.leaflet-container .leaflet-control-attribution {
  background: rgba(255,255,255, 0.9);
}
a[ href *= "maptiler.com" ] {
  background-image: url(https://www.klokantech.com/img/projects/maptiler-logo.svg);
  background-position: right;
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  padding-right: 1.1rem;
}
`;
  }

  get _template () {
    return `
<template>
<link rel="stylesheet" href="${this._leafletStylesheet.href}"
  integrity="${this._leafletStylesheet.integrity}" crossorigin=""/>
<style>${this._styles}</style>
<div id="desc" class="map-desc"><slot><p> Description of the map. </p></slot></div>
<div id="my-map" role="region" aria-describedby="desc" part="map">
  <p class="my-loading">Loading map…</p>
</div>
</template>
`;
  }

  get latLng () { return this.getLatLong(this); }

  get zoom () { return parseInt(this.getAttribute('zoom') || this._defaults.zoom); }

  getLatLong (elem) {
    const str = elem.getAttribute('latlng') || elem.dataset.latlng || `${this._defaults.lat}, ${this._defaults.long}`;
    const parts = str.split(/, ?/) || [0, 0];
    return this._leaflet.latLng(parseFloat(parts[0]), parseFloat(parts[1]));
    // return [parseFloat(parts[0]), parseFloat(parts[1])];
  }

  get geojson () { return this.getAttribute('geojson') || null; }

  /** The CSS selector to use to query for HTML `<marker>` elements.
   *  @default '[latlng]' - Any HTML element with a `latlng` attribute.
   */
  get markerSelector () {
    return this.getAttribute('marker-selector') || '[latlng]';
  }

  /** The name of a marker JS constructor available on the `L` global.
   *  @default 'Marker'
   */
  get markerClass () {
    return this.getAttribute('marker-class') || 'Marker';
  }

  /** Asynchronously get references to Leaflet and the map object.
   * @return { L, map } (Promise)
   */
  async getLeafletMap () {
    await this._whenReady(() => this.$$.map && this.$$.L, 'getLeafletMap');
    return { L: this.$$.L, map: this.$$.map };
  }

  async connectedCallback () {
    this.$$ = {};
    const ATTRS = { latLng: {}, zoom: this.zoom, geojson: this.geojson, tileUrl: this.tileUrl };

    await this._initialize(ATTRS);

    console.debug('<my-map>:', this.$$.L.version, this.$$, this);
  }

  async _initialize (attr) {
    this._attachLocalTemplate(this._template);

    const mapElem = this.shadowRoot.querySelector('#my-map');

    // this.shadowRoot.querySelector('#caption').textContent = attr.caption;

    const L = await this._importLeafletLibs();

    if (L.translate) {
      L.translate.load(this.lang);
    }

    const map = L.map(mapElem, { a11yPlugin: true }).setView(this.latLng, attr.zoom);

    const tiles = L.tileLayer(attr.tileUrl, {
      apiKey: this.apiKey,
      attribution: this.attribution
    }).addTo(map);

    // Was: L.control.scale({ maxWidth: 200 }).addTo(map);

    /* L.DomEvent.on(tiles, 'tileerror', (ev) => {
      console.error('Tile error:', ev);
    }); */

    this.$$ = {
      ...attr, latLng: this.latLng, map, mapElem, tiles, L
    };

    if (attr.geojson) {
      try {
        await this.loadGeoJson(attr.geojson).then(res => res.addTo(map));
      } catch (ex) {
        if (ex instanceof SyntaxError) {
          console.error('JSON Parsing Error -', ex);
        } else {
          console.error(ex);
        }
      }
    }

    this._queryAddChildMarkers();

    const PATH = this.shadowRoot.querySelector('.leaflet-overlay-pane path');
    PATH && PATH.setAttribute('part', 'path');

    return this.$$;
  }

  /** Load non-module Javascript for side-effects (Leaflet added to window).
   */
  async _importLeafletLibs () {
    await this._importJs(this._leafletCdnLibs);
    const { L } = window;
    await this._whenReady(() => L && L.Map, 'import Leaflet'); // Was: L && L.i18n && L.l10n,
    this.$$.L = L;
    return L;
  }

  get _leaflet () {
    return this.$$.L;
  }

  get apiKey () {
    const KEY = this.getAttribute('api-key') || null;
    console.debug('my-map API key:', KEY);
    return KEY;
  }

  get tileUrl () {
    return this.getAttribute('tile-url') || this.getAttribute('tileUrl') || this._defaults.osmTileUrl;
  }

  get attribution () {
    const YEAR = new Date().getFullYear();
    const ATTR = this.getAttribute('attribution') || 'Map data &copy; {OSM} contributors, Imagery © {MB}';
    return ATTR
      .replace('{OSM}', '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
      .replace('{MB}', '<a href="https://www.mapbox.com/">Mapbox</a>')
      .replace('{TF}', '<a href="http://www.thunderforest.com/">Thunderforest</a>')
      .replace('{MT}', '<a href="https://www.maptiler.com/copyright/" part="att mt">MapTiler</a>')
      .replace('{NLS}', '<a href="https://maps.nls.uk/projects/api/" part="att nls">National Library of Scotland</a>')
      .replace('{gb1in}', '<a href="https://maps.nls.uk/projects/api/#gb1inch" title="Great Britain, Ordnance Survey one-inch to the mile (1:63,360), \'Hills\' edition, 1885-1903">GB 1in</a>')
      .replace('{OS}', '<a href="https://osdatahub.os.uk/legal/overview">Ordnance Survey</a>')
      .replace('{OSC}', `Contains <a href="https://osdatahub.os.uk/legal/overview" title="Ordnance Survey">OS data</a> © Crown copyright and database rights ${YEAR}`)
    ;
  }

  /** Construct a marker object.
   */
  marker (latLng, options = {}) {
    return new this._leaflet[this.markerClass](latLng, options);
  }

  _queryAddChildMarkers () {
    const markerElems = this.querySelectorAll(this.markerSelector) || [];
    const markers = [...markerElems].map((markerEl, idx) => {
      const latLng = this.getLatLong(markerEl);
      const data = markerEl.dataset;
      const alt = data.alt || markerEl.title || markerEl.textContent;
      const popupContent = data.popup || markerEl.textContent;
      const options = { alt, ...data };
      const marker = this.marker(latLng, options).addTo(this.$$.map);
      if (popupContent) {
        marker.bindPopup(popupContent);
      }
      return { latLng, popupContent, options, marker };
    });
    console.debug('queryAddChildMarkers:', markers);
  }

  async loadGeoJson (geojson) {
    const resp = await fetch(geojson); // './data/landmarks.geo.json');
    const geoJsonFeatures = await resp.json();

    console.debug('Features:', geoJsonFeatures);
    // const template = document.getElementById('geojson');
    // const geoJsonFeatures = JSON.parse(template.content.textContent);

    let count = 1;

    const res = this._leaflet.geoJSON(geoJsonFeatures,
      {
        pointToLayer: (feat, latLng) => this._svgMarker(feat, latLng, count++),

        onEachFeature: (feature, layer) => {
        // does this feature have a property named popupContent?
          if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);

            // Was: layer.on('popupopen', ev => this._accessibilityFixPopup(ev));
          }
        }
      });
    // .addTo(map)

    return res;
  }

  _svgMarker (feature, latLng, count) {
    const name = feature.properties.name || '[none]';
    const SVG_ID = 'fa-map-pin'; // 'fa-location-dot';

    console.debug(`Marker ${count}: ${name}`, latLng, feature);

    return this._leaflet.marker(latLng, {
      draggable: false, // Accessibility fix (outline) ?
      icon: this._leaflet.divIcon({
        className: 'my-icon',
        html: `<button aria-label="${name}">
          <svg viewBox="0 0 384 512" aria-hidden="true">
            <title>${name}</title>
            <use part="marker" href="#${SVG_ID}"/>
          </svg>
        </button>`
      })
    });
  }

  // DEPRECATED.
  _markerIcon () {
    const L = window.L;

    return L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });
  }
}

// End.
