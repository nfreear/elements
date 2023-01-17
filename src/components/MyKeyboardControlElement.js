/**
 * Navigate a grid, listbox or similar widget using the arrows keys, etc.
 *
 * @TODO Maybe rename to <my-keyboard-nav> ?
 * @TODO Currently auto-detects grid and listbox. Add auto-detect for more?
 *
 * @copyright © Nick Freear, 11-Jan-2023.
 * @see https://w3.org/WAI/ARIA/apg/example-index/grid/dataGrids.html
 * @see ./MyDatePickerElement.js
 */

import MyElement from '../MyElement.js';

const { CustomEvent } = window;

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

export class MyKeyboardControlElement extends MyElement {
  static getTag () {
    return 'my-keyboard-control';
  }

  /** Are we in 1-Dimensional mode?
   */
  get _is1Dim () {
    return this.getAttribute('is1dim') === 'true' || this._isListbox;
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

  async connectedCallback () {
    const NOW = new Date();
    // const today = new Date(this.getAttribute('today') || NOW);
    const selected = new Date(this.getAttribute('selected') || NOW);

    const GRID = this.querySelector(this._gridSelector);

    const rows = this._is1Dim ? [GRID] : GRID.querySelectorAll('tr');
    const cells = GRID.querySelectorAll(this._cellSelector);

    this.$$ = { is1D: this._is1Dim, grid: this._gridSelector, cell: this._cellSelector, selected, rows, cells, GRID };

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

    /** @TODO */
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
    const DATE = ev.target.textContent;

    this._reset();
    this._setSelected(ev.target);
    this._fireSelectedEvent(ev.target, null, null, ev);

    console.debug('click:', DATE, ev);
  }

  _keyupHandler (ev) {
    const COL = parseInt(ev.target.dataset.col) || 0;
    const ROW = parseInt(ev.target.parentElement.dataset.row) || 0; // Aka "ROW"

    // const BEFORE = ev.target.textContent;
    const IS_ARROW = /Arrow/.test(ev.key);
    const DIR = ev.key.replace(/Arrow/, '');
    const IS_1D = this._is1Dim;

    if (IS_ARROW) {
      ev.preventDefault();

      const COORDS = `${COL + this._horiz[DIR]},${IS_1D ? 0 : (ROW + VERT[DIR])}`;
      // @WAS: const COORDS = `${COL + HORIZ[DIR]},${WEEK + VERT[DIR]}`;

      const CELL = this.$$.GRID.querySelector(`[data-coord="${COORDS}"]`);

      if (CELL) {
        this._reset();
        this._setSelected(CELL);
        this._fireSelectedEvent(CELL, DIR, COORDS, ev);
        CELL.focus();
      }

      // AFTER = BEFORE + step;

      console.debug(`keyup: "${COORDS}"`, COL, ROW, IS_ARROW, DIR, ev);
    }
  }

  _fireSelectedEvent (cell, dir, coords, ev) {
    const event = new CustomEvent('selected', {
      detail: { cell, dir, coords, controls: this._getControlsElem(cell), origEvent: ev }
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

MyKeyboardControlElement.define();
