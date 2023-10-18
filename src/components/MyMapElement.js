/**
 * Easily embed a map
 *
 * powered by Leaflet.js - optionally with a GeoJSON feed.
 * Contains accessibility fixes and enhancements.
 *
 * @copyright © Nick Freear, 27-Nov-2021.
 *
 * @see https://codepen.io/nfreear/pen/KKeJKov
 * @see ../demo/my-map.html
 * @see https://leafletjs.com/
 *
 * @status beta
 * @since 1.0.0
 */

import MyElement from '../MyElement.js';

const { fetch } = window;

const LEAFLET_CDN_LIBS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-i18n@0.3.3/Leaflet.i18n.js',
  'https://unpkg.com/leaflet.translate@0.3.0/Leaflet.translate.js',
  'https://unpkg.com/leaflet.a11y@0.3.0/Leaflet.a11y.js'
];

// Some defaults.
const DEF = {
  // Greenwich Observatory, London, UK. (Was: Central London 51.505,-0.09)
  lat: 51.476852,
  long: -0.000500,
  zoom: 13, // Was 14
  // See: github:Leaflet/Leaflet/pull/8418 (Was: 'https://{s}.tile.op..')
  osmTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
};

const TEMPLATE = `
<template>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""/>
<style>
.map-desc {
  color: #333;
  font: 1rem sans-serif;
  max-width: 35rem;
  margin: 0 auto;
}
#my-map {
  border: 1px solid #ddd;
  border-radius: .2rem;
  height: 82vh; /* Was: 78 vh */
  max-height: 540px;
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
</style>
<div id="desc" class="map-desc"><slot> Description of the map. </slot></div>
<div id="my-map" role="region" aria-describedby="desc">
  <p class="my-loading">Loading map…</p>
</div>
</template>
`;

export class MyMapElement extends MyElement {
  static getTag () {
    return 'my-map';
  }

  get lang () { return this.getAttribute('lang') || ''; }

  /* async getMap () {
    return await this._whenReady(() => this.$$.map, 'getMap');
  } */

  async getLeafletMap () {
    await this._whenReady(() => this.$$.map && this.$$.L, 'getMap');
    return { L: this.$$.L, map: this.$$.map };
  }

  async connectedCallback () {
    this.$$ = {};

    const lat = parseFloat(this.getAttribute('lat') || DEF.lat);
    const long = parseFloat(this.getAttribute('long') || DEF.long);
    const zoom = parseInt(this.getAttribute('zoom') || DEF.zoom);
    // const caption = this.getAttribute('caption') || 'A caption for the map.';
    const geojson = this.getAttribute('geojson') || null; // GeoJSON URL is relative to the HTML page!
    const attribution = null;

    const ATTRS = { lat, long, zoom, geojson, tileUrl: this.tileUrl, attribution };

    await this._initialize(ATTRS);

    console.debug('my-map:', this.$$.L.version, this.$$, this);
  }

  async _initialize (attr) {
    // .
    this._attachLocalTemplate(TEMPLATE); // Was: await this.getTemplate('my-map');

    const mapElem = this.shadowRoot.querySelector('#my-map');

    // this.shadowRoot.querySelector('#caption').textContent = attr.caption;

    const L = await this._importLeafletLibs();

    if (L.translate) {
      L.translate.load(this.lang);
    }

    const map = L.map(mapElem, { a11yPlugin: true }).setView([attr.lat, attr.long], attr.zoom);

    const tiles = L.tileLayer(attr.tileUrl, {
      apikey: this.apiKey,
      attribution: this.attribution
    }).addTo(map);

    L.control.scale({ maxWidth: 200 }).addTo(map);

    /* L.DomEvent.on(tiles, 'tileerror', (ev) => {
      console.error('Tile error:', ev);
    }); */

    this.$$ = {
      ...attr, map, mapElem, tiles, L
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

    // Was: this._accessibilityFixes();

    const PATH = this.shadowRoot.querySelector('.leaflet-overlay-pane path');
    PATH && PATH.setAttribute('part', 'path');
  }

  /** Load non-module Javascript for side-effects (Leaflet added to window).
   */
  async _importLeafletLibs () {
    await this._importJs(LEAFLET_CDN_LIBS);
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
    return this.getAttribute('tile-url') || this.getAttribute('tileUrl') || DEF.osmTileUrl;
  }

  get attribution () {
    const ATTR = this.getAttribute('attribution') || 'Map data &copy; {OSM} contributors, Imagery © {MB}';
    return ATTR
      .replace('{OSM}', '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
      .replace('{MB}', '<a href="https://www.mapbox.com/">Mapbox</a>')
      .replace('{TF}', '<a href="http://www.thunderforest.com/">Thunderforest</a>')
    ;
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

  _accessibilityFixes () {
  }

  _accessibilityFixPopup (ev) {
  }
}

MyMapElement.define();

// End.
