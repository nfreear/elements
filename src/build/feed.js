/**
 * Commandline: build a JSON Feed documenting the list of custom elements.
 *
 * @copyright © Nick Freear, 12-Jan-2023.
 * @status experimental
 * @since 1.3.0
 * @file
 */

import CustomElementParser from './CustomElementParser.js';
import * as path from 'node:path';
import { URL } from 'node:url';

const GH_URL = 'https://github.com/nfreear/elements/tree/main/src/components';
// const LIMIT = 40; // 10; // 2;
const FEED = {
  version: 'https://jsonfeed.org/version/1.1',
  title: 'My Elements',
  home_page_url: 'https://nfreear.github.io/elements/demo/',
  feed_url: 'https://nfreear.github.io/elements/src/index.json',
  authors: [{ name: 'Nick Freear' }],
  language: 'en'
};

buildJsonFeed();

async function buildJsonFeed () {
  const __dirname = new URL('.', import.meta.url).pathname;

  const INPUT_DIR = path.resolve(__dirname, '..', 'components');
  // const OUTPUT_FILE = path.resolve(__dirname, '..', '..', 'demo', 'index.json');

  console.warn('Input Dir:', INPUT_DIR);

  const PARSER = new CustomElementParser();

  const FILES = await PARSER.getFileList(INPUT_DIR);

  console.warn('File count:', FILES.length);

  const ITEMS = await PARSER.parseFiles(INPUT_DIR, FILES);

  const JSON_FEED = metaDataToFeed(ITEMS);

  console.log(JSON.stringify(JSON_FEED, null, 2));
}

function metaDataToFeed (data) {
  console.assert(data, '"data" should not be empty, in metaDataToFeed');

  const items = data.map(it => {
    console.assert(it, '"it" should be an object, in metaDataToFeed');
    const { skip, summary, desc, status, demoUrl, className, parentClass, tagName, fileName } = it;
    if (skip) return it;

    const id = tagName;
    const title = `${tagName}: ${summary}`;
    const tags = status ? status.split(/, ?/) : [];
    const url = `${GH_URL}/${fileName}`;
    // eslint-disable-next-line camelcase
    const content_html = `<p>${desc}</p>
<ul>
<li><x>Demo:</x> <a href="${demoUrl || '#'}">${demoUrl}</a>
<li><x>Status:</x> ${status || ''}
<li><x>className:</x> <code>${className}</code>
<li><x>parentClass:</x> <code>${parentClass}</code>
<li><x>tagName:</x> <code>&lt;${tagName}></code>
</ul>`;

    return { id, title, url, tags, content_html, _ext: it }; /* eslint-disable-line camelcase */
  });

  const _date = new Date().toISOString();

  return { ...FEED, _date, _count: items.length, items };
}
