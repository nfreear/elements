const { customElements } = window;

function defineMyElements (mod) {
  console.assert(typeof mod === 'object', '"mod" argument - Should be array or module object.');
  const KLASSES = Object.values(mod).filter(klass => isClass(klass) && isMyElementClass(klass));
  console.assert(KLASSES && KLASSES.length, 'Expecting at least one custom element class.');

  KLASSES.forEach((klass, idx) => {
    console.assert(typeof klass.getTag === 'function', '"getTag()" - Static function not found.');
    customElements.define(klass.getTag(), klass);
    // console.debug(idx, klass.name, klass);
  });
  console.debug('defineMyElements:', KLASSES.length, KLASSES);
}

function isMyElementClass (klass) {
  return /My(\w+)Element/.test(klass.name);
}

// https://stackoverflow.com/questions/526559/testing-if-something-is-a-class-in-javascript
function isClass (func) {
  // Class constructor is also a function
  if (!(func && func.constructor === Function) || func.prototype === undefined) {
    return false;
  }

  // This is a class that extends other class
  if (Function.prototype !== Object.getPrototypeOf(func)) {
    return true;
  }

  // Usually a function will only have 'constructor' in the prototype
  return Object.getOwnPropertyNames(func.prototype).length > 1;
}

export { defineMyElements, isMyElementClass, isClass };
