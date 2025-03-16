
## Version 1.7.0

* Release: 16-Mar-2025,
* Fix: remove calls to static `define()` function - tree shaking/bundling (#50)
* Fix: new `MyMinElement` minimal base class (#50)
* Fix: `web.js` - for direct browser user. Imports all custom elements, including dynamic-import ones (#50)
* Fix: new `index.js` - for build tools/bundlers (#50)
* Fix: fix `src/build/feed` and `MyFeedElement` javascript
* New entry point `i.js` - dynamically load custom elements via `importmap` (#48)

New custom elements:

* `<my-live-bridge>` (#51)
* `<my-element-filter>` (#49)
* `<my-input>` (#49)
* `<my-codepen-button>` (#47)
* `<my-dev-warning>` (#46)
* `<my-paste-target>` (#45)

## Version 1.6.0

* Release: 28-Oct-2023,
* First release of @nfreear/my-map (#42)
* Mono-repo hybrid (#42)
* Updates to `<my-map>` (#40)
* `<my-map>` - support child `<marker>` elements (#44)
* New entry point `my.js?my-elem` - dynamically import custom elements via URL query parameter (#43)
* `<my-math>` (#41)
* Etc.

## Version 1.5.0

* Release: 24-Feb-2023.
* [npmjs.com/package/ndf-elements](https://www.npmjs.com/package/ndf-elements)

## Version 1.2.0

* Date:  15-April-2022,
* Rename package from `ndf-web-components` to `ndf-elements` (#20)

## Version 1.1.0

* Date:  30-March-2022,
* Add `customImport()` method (#9)
* Fix import order (#8)
* Add `leafletViaCdn()`, `rainbowViaCdn()` … methods (#3)
* Documentation (#15)
* Accessibility fixes (#11)

New custom elements:

* `<my-atbar-button>`
* `<my-bookmarklet>`
* `<my-code>`
* `<my-font>`
* `<my-search>`
* `<my-text-to-speech>`

## Version 1.0.0

* Date:  09-January-2022,
* First publish to Npmjs.com

---
[← Readme](https://github.com/nfreear/elements#readme)
