/**
 * Setup and get configuration options.
 *
 * @copyright © Nick Freear, 11-Dec-2021.
 */

/** @see package.json
 */
const version = '1.2.0';

const $_OPTIONS = { $$: { version } };

/**
 * @public
 */
export function getOpt (key = null) {
  return key && key in $_OPTIONS.$$ ? $_OPTIONS.$$[key] : $_OPTIONS.$$;
}

/* export function setOpt (key, value = null) {
  $_OPTIONS.$$[key] = value;
} */

/* export function setVersion (version) {
  $_OPTIONS.$$.version = version;
} */

/**
 * @private
 */
export function setupOptions (options) {
  const DEFAULTS = $_OPTIONS.$$;

  $_OPTIONS.$$ = { ...options, ...DEFAULTS };
}

/**
 * @public
 */
export function getOptUse (uses) {
  const useStr = uses || getOpt('use');

  const USE = useStr.split(/[, ]/).filter(it => it !== '');

  const elemKlassArray = USE.map(elem => {
    // if (elem === '') return null;
    return { elem, klass: elemToClass(elem) };
  });

  return elemKlassArray;
}

/**
 * @public
 */
export function elemToClass (elem) {
  const KLASS = elem.replace(/(^|-)([a-z])/g, (mtch, p1, p2) => p2.toUpperCase());
  return `${KLASS}Element`;
}

/**
 * @public
 */
export function hasElem (sel) {
  return document.querySelector(sel);
}

/*
export async function ifElem (selector, callbackFn) {
  if (document.querySelector(selector)) {
    return await callbackFn();
  }
} */
