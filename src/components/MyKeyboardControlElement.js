/**
 * Navigate a custom control using arrow keys.
 *
 * Adjust an ARIA-based control such as a grid or listbox using the arrows keys.
 * The <tt>&lt;my-keyboard-control></tt> element automatically detects some control-types, including listbox and grid, and adjusts to 1- or 2-dimensional navigation accordingly.
 *
 * @TODO Currently auto-detects grid and listbox. Add auto-detect for more?
 * @TODO Maybe rename to <my-keyboard-nav> ?
 *
 * @copyright © Nick Freear, 11-Jan-2023.
 * @demo https://codepen.io/nfreear/pen/jOpLNxR
 * @see https://w3.org/WAI/ARIA/apg/practices/keyboard-interface/
 * @see https://w3.org/WAI/ARIA/apg/example-index/grid/dataGrids.html
 * @see ./MyDatePickerElement.js
 * @customElement my-keyboard-control
 * @status experimental, accessibility
 * @since 1.3.0
 */

const { CustomEvent, HTMLElement } = window || globalThis;

const HORIZ = {
  Left: -1,
  Right: 1,
  Up: 0,
  Down: 0
};
const VERT = {
  Left: 0,
  Right: 0,
  Up: -1,
  Down: 1
};
const BOTH = {
  Left: -1,
  Right: 1,
  Up: -1,
  Down: 1
};

export class MyKeyboardControlElement extends HTMLElement {
  static getTag () {
    return 'my-keyboard-control';
  }

  /** Are we in 1-Dimensional mode?
   */
  get _is1Dim () {
    const IS_1D = this.getAttribute('is1dim') === 'true'; // DEPRECATED.
    return IS_1D || /(horiz|vert)/.test(this._orient) || this._isListbox;
  }

  get _orient () {
    return this.getAttribute('orient');
  }

  get _isListbox () {
    return this.dataset.role === 'listbox' || !!this.querySelector('[ role = listbox ]');
  }

  get _gridSelector () {
    return this._isListbox ? '[ role = listbox ]' : this.getAttribute('grid-selector') || 'table tbody';
  }

  get _cellSelector () {
    return this._isListbox ? '[ role = option ]' : this.getAttribute('cell-selector') || 'td';
  }

  get _addStyle () {
    return this.getAttribute('add-style');
  }

  async connectedCallback () {
    this._coord = { x: 0, y: 0 };

    const NOW = new Date();
    // const today = new Date(this.getAttribute('today') || NOW);
    const selected = new Date(this.getAttribute('selected') || NOW);

    const GRID = this.querySelector(this._gridSelector);

    const rows = this._is1Dim ? [GRID] : GRID.querySelectorAll('tr');
    const cells = GRID.querySelectorAll(this._cellSelector);

    this.$$ = { is1D: this._is1Dim, orient: this._orient, grid: this._gridSelector, cell: this._cellSelector, selected, rows, cells, GRID };

    this._initialize();

    this.addEventListener('click', ev => this._clickHandler(ev)); // Was: GRID.
    this.addEventListener('keyup', ev => this._keyupHandler(ev));

    console.debug('my-keyboard-control:', this.$$, this);
  }

  _initialize () {
    this.$$.rows.forEach((row, ridx) => {
      row.setAttribute('data-row', ridx); // Was: 'week'

      const R_CELLS = row.querySelectorAll(this._cellSelector);
      // @WAS: const R_CELLS = row.querySelectorAll('td');

      R_CELLS.forEach((cell, cidx) => {
        // cell.setAttribute('role', 'gridcell');
        if (cell.getAttribute('tabindex') !== '0') {
          cell.setAttribute('tabindex', -1);
        }

        cell.setAttribute('data-col', cidx);
        cell.setAttribute('data-coord', `${cidx},${ridx}`);
      });
    });

    const CELLS = this.$$.cells;
    // const TODAY = this.$$.today.getDate();
    const SELECTED = this.$$.selected.getDate();

    // const CELL_TODAY = [...CELLS].find(el => parseInt(el.textContent) === TODAY);
    const CELL_SELECTED = [...CELLS].find(el => parseInt(el.textContent) === SELECTED);

    // CELL_TODAY.setAttribute('aria-current', 'date');
    // CELL_TODAY.title = 'current';

    this._setSelected(CELL_SELECTED);
  }

  _reset () {
    this.$$.cells.forEach(cell => {
      // cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-selected', 'false');
      cell.setAttribute('tabindex', -1);
    });
  }

  _setSelected (cell) {
    if (!cell) {
      return console.warn('Warning: no selected cell.');
      // @WAS throw new Error('No selected cell');
    }

    cell.setAttribute('aria-selected', true);
    cell.setAttribute('tabindex', 0);
  }

  _clickHandler (ev) {
    const { target } = ev;
    const TEXT = target.textContent;

    this._reset();
    this._setSelected(target);
    this._fireSelectedEvent(target, null, null, null, ev);

    console.debug('click:', TEXT, ev);
  }

  _keyupHandler (ev) {
    const { key, target } = ev;

    const COL = parseInt(target.dataset.col) || 0;
    const ROW = parseInt(target.parentElement.dataset.row) || 0; // Aka "ROW"

    // const BEFORE = ev.target.textContent;
    const DIR = this._arrowDirection(ev); // key.replace(/Arrow/, '');
    const IS_1D = this._is1Dim;

    if (this._isArrowKey(ev) && !this._isModKey(ev)) {
      ev.preventDefault();

      this._setCoordFromEvent(ev);

      const COORDS = `${COL + this._horiz[DIR]},${IS_1D ? 0 : (ROW + VERT[DIR])}`;
      // @WAS: const COORDS = `${COL + HORIZ[DIR]},${WEEK + VERT[DIR]}`;

      const CELL = this.$$.GRID.querySelector(`[data-coord="${COORDS}"]`);

      if (CELL) {
        this._reset();
        this._setSelected(CELL);
        this._fireSelectedEvent(CELL, DIR, COORDS, key, ev);
        CELL.focus();
      }

      this._setStyleFromCoord();

      // AFTER = BEFORE + step;

      console.debug(`keyup: "${COORDS}"`, this._coord, COL, ROW, this._isArrowKey(ev), DIR, ev);
    }
  }

  _isModKey (ev) {
    return ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey;
  }

  _isArrowKey (ev) { return /Arrow/.test(ev.key); }

  _arrowDirection (ev) { return ev.key.replace(/Arrow/, ''); }

  _setCoordFromEvent (ev) {
    const DIR = this._arrowDirection(ev);
    this._coord.x += HORIZ[DIR];
    this._coord.y += VERT[DIR];
  }

  _setStyleFromCoord () {
    if (this._addStyle) {
      this.style.setProperty('--my-kc-x', this._coord.x + 'px');
      this.style.setProperty('--my-kc-y', this._coord.y + 'px');
    }
  }

  _fireSelectedEvent (cell, dir, coords, key, ev) {
    const event = new CustomEvent('selected', {
      detail: { cell, dir, coords, key, controls: this._getControlsElem(cell), origEvent: ev }
    });
    this.dispatchEvent(event);
  }

  _getControlsElem (cell) {
    const CONTROLS = cell.getAttribute('aria-controls') || null;
    return CONTROLS ? document.getElementById(CONTROLS) : null;
  }

  get _horiz () {
    return this._is1Dim ? BOTH : HORIZ;
  }

  get _vert () {
    return this._is1Dim ? BOTH : VERT;
  }
}

// Was: customElements.define(MyKeyboardControlElement.getTag(), MyKeyboardControlElement);
