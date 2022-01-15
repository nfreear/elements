/*!
 Easily embed a map powered by Leaflet.js - optionally with a GeoJSON feed.

  Nick Freear, 27-Nov-2021.

 * @WAS 'my-map.js'
*/

import { MyElement } from '../MyElement.js';

const { fetch } = window;
// const L = window.L;

export class MyMapElement extends MyElement {
  static getTag () {
    return 'my-map';
  }

  constructor () {
    super();

    const lat = parseFloat(this.getAttribute('lat') || 51.505);
    const long = parseFloat(this.getAttribute('long') || -0.09);
    const zoom = parseInt(this.getAttribute('zoom') || 14);
    // const caption = this.getAttribute('caption') || 'A caption for the map.';
    const geojson = this.getAttribute('geojson') || null; // GeoJSON URL is relative to the HTML page!
    const tileUrl = this.getAttribute('tileUrl') || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = this.getAttribute('attribute') || 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    const ATTRS = { lat, long, zoom, geojson, tileUrl, attribution };

    this.initialize(ATTRS);
  }

  async initialize (attr) {
    // .
    await this.getTemplate('my-map');

    const mapElem = this.shadowRoot.querySelector('#my-map');

    // this.shadowRoot.querySelector('#caption').textContent = attr.caption;

    /* setTimeout(() => {
      const SC = document.createElement('script');
      SC.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';

      this.shadowRoot.appendChild(SC);
    }, 100); */

    setTimeout(async () => {
      const L = window.L;

      const map = L.map(mapElem).setView([attr.lat, attr.long], attr.zoom);

      const tiles = L.tileLayer(attr.tileUrl, {
        attribution: attr.attribution
      }).addTo(map);

      this.$$ = {
        ...attr, map, mapElem, tiles, L
      };

      if (attr.geojson) {
        await this.loadGeoJson(attr.geojson).then(res => res.addTo(map));
      }

      // this._accessibilityFixes();

      console.debug('my-map:', L.version, this.$$, this);
    }, 1800); // Was: 250;
  }

  async loadGeoJson (geojson) {
    const L = window.L;

    const resp = await fetch(geojson); // './data/landmarks.geo.json');
    const geoJsonFeatures = await resp.json();

    console.debug('Features:', geoJsonFeatures);
    // const template = document.getElementById('geojson');
    // const geoJsonFeatures = JSON.parse(template.content.textContent);

    let count = 0;

    const res = L.geoJSON(geoJsonFeatures,
      {
        pointToLayer: (feature, latlng) => {
          // console.debug('pointToLayer:', feature, latlng);
          const NAME = feature.properties.name;
          count++;

          return L.marker(latlng, {
            alt: `Marker ${count}: ${NAME}`, // Accessibility !!
            // title: `Marker ${count}: ${NAME}`,
            icon: this._markerIcon()
          });
        },
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
    const MARKERS = this.shadowRoot.querySelectorAll('.leaflet-marker-pane [ tabindex ]');

    MARKERS.forEach(marker => { marker.title = marker.alt; });
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

// Was: customElements.define('my-map', MyMap);
