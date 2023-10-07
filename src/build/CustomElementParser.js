/**
 * Collect meta-data about each custom element and MJS class.
 *
 * @copyright © Nick Freear, 12-Jan-2023.
 *
 * @class CustomElementParser
 * @status experimental
 * @since 1.3.0
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
// import { URL } from 'url';

const FILE_LIMIT = 40; // 10; // 2;
const MJS_EXT = '.js';

export default class CustomElementParser {
  // .
  constructor (fileLimit = FILE_LIMIT) {
    this._fileLimit = fileLimit;
  }

  parse (str, idx = null, fileName = null) {
    const $ = this;

    const DATA = {
      idx,
      // Parse JSDoc comments.
      summary: $.matchAndGet(str, /\*\*\n \* (.+)/),
      desc: $.multiLineTrim($.matchAndGet(str, /\*\*\n \* ([^@]+)@/ms)), // WAS: /\*\*\n \* ([\w \n,!\.\*-]+)@/ms),
      date: $.matchAndGet(str, /@copyright © [\w ]+, ([\w-]+-202\d)/),
      isoDate: null,
      since: $.matchAndGet(str, /@since v?(\d\.\d.+)/),
      status: $.matchAndGet(str, /@status (.+)/),
      todo: $.matchAndGet(str, /@todo (.+)/i),
      demoUrl: $.matchAndGet(str, $.demoUrlRegex),
      demoIsPen: !!$.matchAndGet(str, $.demoIsPenRegex),
      // Parse Javascript code.
      className: $.matchAndGet(str, $.classNameRegex),
      parentClass: $.matchAndGet(str, $.parentClassRegex),
      tagName: $.matchAndGet(str, $.tagNameRegex),
      extTemplate: $.matchAndGet(str, $.extTemplateRegex),
      hasIntTemplate: !!$.matchAndGet(str, $.intTemplateRegex),
      fileName
    };

    DATA.isoDate = DATA.date ? new Date(DATA.date).toISOString().replace(/T.+/, '') : null;

    // console.log('Data:', file, DATA);

    return DATA;
  }

  async parseFiles (dir, fileNames) {
    // console.warn('File count:', fileNames.length);

    const PROMS = await fileNames.map(async (file, fileIdx) => {
      if (fileIdx >= this._fileLimit) return;

      // const BASE = path.basename(file, MJS_EXT);

      const FILE_PATH = path.resolve(dir, file);
      const INPUT = await fs.readFile(FILE_PATH, 'utf8');

      return await this.parse(INPUT, fileIdx, file);
    });

    return await Promise.all(PROMS);
  }

  async getFileList (dir, ext = MJS_EXT) {
    const FILES = await fs.readdir(dir, { withFileTypes: false });

    return FILES.filter(file => path.extname(file) === ext);
  }

  matchAndGet (inputStr, regex, idx = 1) {
    const MATCHES = inputStr.match(regex);
    return MATCHES ? MATCHES[idx] : null;
  }

  multiLineTrim (inputStr) {
    // console.error('>> multiLineTrim:', inputStr);
    return inputStr ? inputStr.replace(/[\n *]+$/, '').replace(/\n \*/g, '\n') : '';
  }

  get demoUrlRegex () {
    return /@see (https:\/\/codepen.io\/nfreear\/.+|..\/demo\/[\w-]+\.html)/;
  }

  get demoIsPenRegex () {
    return /@see (https:\/\/codepen.io\/nfreear\/.+)/;
  }

  /** Parse Javascript code.
   */

  get classNameRegex () {
    return /class (\w+) extends/;
  }

  get parentClassRegex () {
    return /extends (\w+) \{/;
  }

  get tagNameRegex () {
    return /getTag \(\) \{\n\s+return '([\w-]+)'/ms;
  }

  get extTemplateRegex () {
    return / {2}await this.getTemplate\('([\w-]+)/;
  }

  get intTemplateRegex () {
    return /(this._attachLocalTemplate)/;
  }
}
