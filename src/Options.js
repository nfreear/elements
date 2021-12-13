/*!
  Setup and get configuration options.

  © Nick Freear, 11-Dec-2021.
*/

const $_OPTIONS = { $$: {} };

export function getOpt (key = null) {
  return key && key in $_OPTIONS.$$ ? $_OPTIONS.$$[key] : $_OPTIONS.$$;
}

export function setupOptions (options) {
  $_OPTIONS.$$ = options;
}
