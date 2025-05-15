
/**
 * @source Options.js
 */
export function elemToClass (elem) {
  const KLASS = elem.replace(/(^|-)([a-z])/g, (mtch, p1, p2) => p2.toUpperCase());
  return `${KLASS}Element`;
}

/**
 * Get data from an importmap.
 * @copyright © Nick Freear, 15-Mar-2025.
 */
export function importMapOpt (key, key2 = null) {
  const importMapElement = document.querySelector('script[ type = importmap ]');
  const importMap = importMapElement ? JSON.parse(importMapElement.textContent) : null;
  const OPT = importMap ? importMap[key] : null;
  if (key2) {
    return OPT ? OPT[key2] : null;
  }
  return OPT;
}

/** Load non-module Javascript for side-effects (Leaflet added to window).
 * @source MyElement.js
 * @return {Promise}
 */
export async function importJs (importArray) {
  const promises = importArray.map(async (js) => {
    return await import(js);
  });
  return await Promise.all(promises);
}

/** _whenReady: Wait for 'testCallbackFunc' to return truthy value, then resolve the promise.
 * @source MyElement.js
 * @return {Promise}
 */
export async function whenReady (testCallbackFunc, reason, intervalMs = 250, timeoutMs = 2500) {
  console.assert(testCallbackFunc);
  return new Promise((resolve, reject) => {
    const toId = setTimeout(() => reject(new Error(`whenReady: ${reason}`)), timeoutMs);
    const intId = setInterval(() => {
      const VALUE = testCallbackFunc();
      if (VALUE) {
        clearTimeout(toId);
        clearInterval(intId);
        resolve(VALUE);
      }
    }, parseInt(intervalMs));
  });
}
