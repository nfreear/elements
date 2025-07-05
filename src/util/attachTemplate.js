/**
 * A fluent utility to attach a HTML template to an element.
 * @copyright © Nick Freear, 05-July-2025.
 * @example attachTemplate(templateHtml).to.shadowDOM(this)
 */
export function attachTemplate (templateHtml) {
  console.assert(templateHtml, 'templateHtml - required');
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(templateHtml, 'text/html');

  const template = doc.querySelector('template');
  console.assert(template);
  const docFragment = template.content.cloneNode(true);

  return {
    to: {
      shadowDOM: (element) => {
        element.attachShadow({ mode: 'open' }).appendChild(docFragment);
      },
      element: (element) => {
        element.appendChild(docFragment);
      }
    }
  };
}

export default attachTemplate;
