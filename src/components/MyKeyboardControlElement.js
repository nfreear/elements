/**
 * Control a grid, listbox or similar widget with the arrows keys.
 *
 * @TODO Currently needs left/right arrow keys for vertical listboxes.
 *
 * @copyright © Nick Freear, 11-Jan-2023.
 * @see ./MyDatePickerElement.js
 */

import MyElement from '../MyElement.js';

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

export class MyKeyboardControlElement extends MyElement {
  static getTag () {
    return 'my-keyboard-control';
  }

  get _isListbox () {
    return this.dataset.role === 'listbox' || this.querySelector('[ role = listbox ]');
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

    const rows = this._isListbox ? [GRID] : GRID.querySelectorAll('tr');
    const cells = GRID.querySelectorAll(this._cellSelector);

    this.$$ = { grid: this._gridSelector, cell: this._cellSelector, selected, rows, cells, GRID };

    this._initialize();

    GRID.addEventListener('click', ev => this._clickHandler(ev));
    GRID.addEventListener('keyup', ev => this._keyupHandler(ev));

    console.debug('my-keyboard-control:', this.$$, this);
  }

  _initialize () {
    this.$$.rows.forEach((row, week) => {
      row.setAttribute('data-week', week);

      const R_CELLS = row.querySelectorAll(this._cellSelector);
      // @WAS: const R_CELLS = row.querySelectorAll('td');

      R_CELLS.forEach((cell, idx) => {
        // cell.setAttribute('role', 'gridcell');
        if (cell.getAttribute('tabindex') !== '0') {
          cell.setAttribute('tabindex', -1);
        }

        cell.setAttribute('data-col', idx);
        cell.setAttribute('data-coord', `${idx},${week}`);
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

    console.debug('click:', DATE, ev);
  }

  _keyupHandler (ev) {
    const COL = parseInt(ev.target.dataset.col) || 0;
    const WEEK = parseInt(ev.target.parentElement.dataset.week) || 0;

    // const BEFORE = ev.target.textContent;
    const IS_ARROW = /Arrow/.test(ev.key);
    const DIR = ev.key.replace(/Arrow/, '');

    if (IS_ARROW) {
      ev.preventDefault();

      const COORDS = `${COL + HORIZ[DIR]},${WEEK + VERT[DIR]}`;

      const CELL = this.$$.GRID.querySelector(`[data-coord="${COORDS}"]`);

      if (CELL) {
        this._reset();
        this._setSelected(CELL);
        CELL.focus();
      }

      // AFTER = BEFORE + step;

      console.debug(`keyup: "${COORDS}"`, COL, WEEK, IS_ARROW, DIR, ev);
    }
  }
}

MyKeyboardControlElement.define();
