/**
 * @name Hello!
 * @summary A shorter description.
 * @desc This is an example 'Hello world!' bookmarklet.
 *
 * It should be able to span multiple lines & paragraphs.
 * @author Nick Freear
 * @license MIT
 * @version 1.0
 * @see https://jsdoc.app/#block-tags
 * @see https://wiki.greasespot.net/Metadata_Block
 * @todo A todo.
 * @example Provide an example of how to use..
 */

(() => {
  document.body.style = 'outline:4px solid red;outline-offset:-.2rem;';

  console.warn('I’m an example bookmarklet!');
})();
