/**
 * Easily embed a map powered by Leaflet.js - optionally with a GeoJSON feed.
 *
 * Contains accessibility fixes.
 *
 * @copyright © Nick Freear, 27-Nov-2021.
 *
 * @see https://leafletjs.com/
 * @WAS 'my-map.js'
 */

import { leafletViaCdn } from '../external-cdn.js';
import { MyElement } from '../MyElement.js';

const { fetch } = window;
// const L = window.L;

// See: github:Leaflet/Leaflet/pull/8418 (Was: 'https://{s}.tile.op..')
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export class MyMapElement extends MyElement {
  static getTag () {
    return 'my-map';
  }

  async connectedCallback () {
    const lat = parseFloat(this.getAttribute('lat') || 51.505);
    const long = parseFloat(this.getAttribute('long') || -0.09);
    const zoom = parseInt(this.getAttribute('zoom') || 14);
    // const caption = this.getAttribute('caption') || 'A caption for the map.';
    const geojson = this.getAttribute('geojson') || null; // GeoJSON URL is relative to the HTML page!
    const attribution = null;

    const ATTRS = { lat, long, zoom, geojson, tileUrl: this.tileUrl, attribution };

    await this._initialize(ATTRS);

    console.debug('my-map:', this.$$.L.version, this.$$, this);
  }

  async _initialize (attr) {
    // .
    await this.getTemplate('my-map');

    const mapElem = this.shadowRoot.querySelector('#my-map');

    // this.shadowRoot.querySelector('#caption').textContent = attr.caption;

    const L = await leafletViaCdn();

    const map = L.map(mapElem).setView([attr.lat, attr.long], attr.zoom);

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
      await this.loadGeoJson(attr.geojson).then(res => res.addTo(map));
    }

    this._accessibilityFixes();
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
    return this.getAttribute('tile-url') || this.getAttribute('tileUrl') || OSM_TILE_URL;
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

            layer.on('popupopen', ev => this._accessibilityFixPopup(ev));
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
            <use href="#${SVG_ID}"/>
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
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
    });
  }

  _accessibilityFixes () {
    const MARKER_PANE = this.shadowRoot.querySelector('.leaflet-marker-pane');
    const MARKERS = MARKER_PANE.querySelectorAll('.my-icon');
    // const BUTTONS = MARKER_PANE.querySelectorAll('button');

    // MARKERS.forEach(marker => { marker.title = marker.alt; });
    MARKERS.forEach(marker => {
      marker.removeAttribute('tabindex');
      marker.setAttribute('role', 'listitem');
    });

    /* setTimeout(() => {
      BUTTONS.forEach(btn => { btn.style = ''; });
    },
    1000); */

    MARKER_PANE.setAttribute('role', 'list');
    MARKER_PANE.setAttribute('aria-label', 'Map markers');
  }

  _accessibilityFixPopup (ev) {
    const CLOSE_BTN = ev.popup._closeButton; // ev.target._popup._closeButton;
    // const CLOSE_BTN = this.shadowRoot.querySelector('.leaflet-popup-close-button');
    const POPUP = ev.popup._wrapper.parentElement;

    CLOSE_BTN.setAttribute('role', 'button');
    CLOSE_BTN.setAttribute('aria-label', 'Close popup');
    CLOSE_BTN.title = 'Close popup';
    CLOSE_BTN.focus();

    POPUP.setAttribute('role', 'dialog');

    console.debug('Event:', ev);
  }
}

MyMapElement.define();

// End.
