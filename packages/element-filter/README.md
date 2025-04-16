
# element-filter

Filter a collection of elements, based on the value of a search input field.

* Live demo: [CodePen][]
* JavaScript class: [`MyElementFilterElement`][[MyElementFilterEl]

## Usage

```sh
npm i element-filter --save
```

Import for side-effects:
```js
import 'element-filter';
```

Via CDN:
```html
<script src="https://unpkg.com/element-filter@^1" type="module"></script>

<element-filter
  selector="label"
  label="Filter cities"
  >
  <label><input type="radio">Abu Dhabi</label>
  <label><input type="radio">Abuja</label>
  <label><input type="radio">Adamstown</label>
  …
  …
</element-filter>
```

## Attributes

* `selector` - (required) A CSS selector for the collection of elements. (Queried relative to `this` element - `this.querySelectorAll(this.selector)`.)
* `label` - (optional) A text label for the search input field (Default: "Filter").
* `autocomplete` - (optional) A token list, as defined in [autocomplete][] and [HTML 5.2][].

## Styling

Each element in the search/filter shadow DOM can be styled from an external stylesheet using [`::part()`][part]. For example, `::part(input)`.

## License

* [MIT][]

[codepen]: https://codepen.io/nfreear/pen/wBvrNzO
[myElementFilterEl]: https://github.com/nfreear/elements/blob/main/src/components/MyElementFilterElement.js
[mit]: https://github.com/nfreear/elements/blob/main/LICENSE.txt
[autocomplete]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
[part]: https://developer.mozilla.org/en-US/docs/Web/CSS/::part
[html 5.2]: https://www.w3.org/TR/WCAG22/#input-purposes
