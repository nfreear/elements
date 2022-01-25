/**
 * Wait for Javascripts linked to from external CDNs to load.
 *
 * @copyright © Nick Freear, 23-Jan-2022.
 */

export async function rainbowViaCdn () {
  const RES = await whenTimeout(() => window.Rainbow, 'Rainbow');
  console.debug('Rainbow - CDN:', RES);
  return RES;
}

/**
 * When a time-dependent condition is met, resolve a promise.
 * If a timeout expires - reject the promise.
 *
 * @see https://gist.github.com/nfreear/f40470e1aec63f442a8a
 * @see https://github.com/nfreear/whendo.git
 */
export function whenTimeout (testCallbackFn, id = null, timeoutMs = 6000, intervalMs = 150) {
  return new Promise((resolve, reject) => {
    const TID = {};

    TID.interval = setInterval(() => {
      const RESULT = testCallbackFn();
      if (RESULT) {
        clearAll();
        resolve(RESULT);
      }
    },
    intervalMs);

    TID.timeout = setTimeout(() => {
      clearAll();
      reject(new Error(`whenTimeout expired: ${id}`));
    },
    timeoutMs);

    function clearAll () {
    // const clearAll=()=>{
      clearInterval(TID.interval);
      clearTimeout(TID.timeout);
    }
  });
}
