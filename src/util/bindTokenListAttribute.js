/**
 * Initialise a DOMTokenList from an attribute on a HTML element, then update the attribute.
 * @copyright © Nick Freear, 05-July-2025.
 */
export function bindTokenListAttribute (element, attributeName) {
  console.assert(element, 'HTML element - required');
  console.assert(attributeName, 'Attribute name - required');

  const attr = element.getAttribute(attributeName);
  const initialTokens = attr ? attr.trim().replace(/[ ]+/, ' ').split(' ') : [];
  const tokenListProxy = createObservedDOMTokenList(
    (mutation) => {
      element.setAttribute(attributeName, tokenListProxy.tokenList.toString());
    },
    initialTokens
  );
  return tokenListProxy;
}

/**
 * @see https://stackoverflow.com/questions/29172515/constructing-a-domtokenlist-domsettabletokenlist-instance
 */
export function createObservedDOMTokenList (callbackFN, initialTokens = []) {
  console.assert(typeof callbackFN === 'function', 'callbackFN - required');

  const proxyElement = document.createElement('div');
  const tokenList = proxyElement.classList;

  if (initialTokens) {
    initialTokens.forEach((token) => tokenList.add(token));
  }

  const observer = new window.MutationObserver((mutationList, obs) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'attributes') {
        console.debug('Attribute mutation:', mutation);
        callbackFN(mutation);
      }
    }
  });

  observer.observe(proxyElement, { attributes: true });

  return { tokenList, proxyElement, _disconnect: () => { observer.disconnect(); } };
}
