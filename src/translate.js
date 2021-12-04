/*!


  © Nick Freear, 27-Nov-2021.
*/

export async function translate() {
  if (!'content' in document.createElement('template')) {
    throw new Error('Template not supported!');
  }

  const LANG = getLanguage();
  const SELECTOR = 'title, header > *, nav a, footer > *';
  const ELEMS = document.querySelectorAll(SELECTOR);
  const DATA = await getTranslationData();

  const TRANSLATIONS = DATA.translations[ LANG ];

  console.log('Translations:', LANG, ELEMS, TRANSLATIONS);

  if (!TRANSLATIONS) {
    throw new Error(`Translations not found! Lang: '${LANG}'`);
  }

  [...ELEMS].forEach(EL => {
    const msgid = EL.textContent.trim();

    const found = TRANSLATIONS.find(row => row.id === msgid);
    if (found) {
      EL.textContent = found.str;
      EL.lang = LANG;
    }

    console.debug('>', EL, `'${msgid}'`, found);
  });
}

function getLanguage() {
  return location.search.replace(/.*lang=([a-z]{2}(-[a-z]{2,})*)/, '$1' ) || 'en'; // zh-hans';
}

async function getTranslationData(LANG) {
  /*   const TEMPLATE = document.querySelector('#translations');
  const DATA = JSON.parse(TEMPLATE.content.textContent);
  const TRANSLATIONS = DATA.translations[ LANG ]; */

  const translationsUrl = './data/translations.all.json';

  const RESP = await fetch(translationsUrl);
  const DATA = await RESP.json();
  const TRANSLATIONS = DATA.translations[ LANG ];

  return DATA;
}

if (document.querySelector('script[ data-translate = auto ]')) {
  translate();
}
