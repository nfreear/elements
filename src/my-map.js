/*!
 Easily embed a map powered by Leaflet.js - optionally with a GeoJSON feed.
*/

// const L = window.L;

export class MyMap extends HTMLElement {
  constructor() {
    super();

    const lat = parseFloat(this.getAttribute('lat') || 51.505);
    const long = parseFloat(this.getAttribute('long') || -0.09);
    const zoom = parseInt(this.getAttribute('zoom') || 14);
    const caption = this.getAttribute('caption') || 'A caption for the map.';
    const geojson = this.getAttribute('geojson') || null; // GeoJSON URL is relative to the HTML page!
    const tileUrl = this.getAttribute('tileUrl') || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = this.getAttribute('attribute') || 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    const ATTRS = { lat, long, zoom, caption, geojson, tileUrl, attribution };

    this.initialize(ATTRS);
  }

  async initialize(attr) {
    //.
    await this.getTemplate('my-map');

    const mapElem = this.shadowRoot.querySelector('#my-map');

    this.shadowRoot.querySelector('#caption').textContent = attr.caption;

    /* setTimeout(() => {
      const SC = document.createElement('script');
      SC.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';

      this.shadowRoot.appendChild(SC);
    }, 100); */

    setTimeout(() => {
      const L = window.L;

      const map = L.map(mapElem).setView([ attr.lat, attr.long ], attr.zoom);

      const tiles = L.tileLayer(attr.tileUrl, {
        attribution: attr.attribution
      }).addTo(map);

      this.$$ = {
        ...attr, map, mapElem, L
      };

      this.loadGeoJson(attr.geojson).then(res => res.addTo(map));

      console.debug('my-map:', this.$$, this);
    }, 800); // Was: 250;
  }

  // https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
  async getTemplate(id) {
    // const template = document.getElementById('my-map-template');
    // const templateContent = template.content;

    // URL is relative to the HTML page!
    const url = `../src/${id}.tpl.html`;

    const resp = await fetch(url);
    const html = await resp.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const template = doc.querySelector('template');
    const root = template.content.cloneNode(true);

    this.attachShadow({mode: 'open'}).appendChild(root);

    return template;
  }

  async loadGeoJson(geojson) {
    const L = window.L;

    const resp = await fetch(geojson); // './data/landmarks.geo.json');
    const geoJsonFeatures = await resp.json();

    console.debug('Features:', geoJsonFeatures);
    // const template = document.getElementById('geojson');
    // const geoJsonFeatures = JSON.parse(template.content.textContent);

    const res = L.geoJSON(geoJsonFeatures,
    {
      pointToLayer: (feature, latlng) => {
        // console.debug('pointToLayer:', feature, latlng, markerIcon);
        return L.marker(latlng, { icon: this.markerIcon() });
      },
      onEachFeature: (feature, layer) => {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
        }
      }
    });
    // .addTo(map)

    return res;
  }

  markerIcon () {
    const L = window.L;

    return L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
    });
  }
}

customElements.define('my-map', MyMap);
