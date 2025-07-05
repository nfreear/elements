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

export default importMapOpt;
