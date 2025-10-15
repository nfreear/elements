import attachTemplate from '../util/attachTemplate.js';
// import { MyElement } from '../MyElement.js';

const { speechSynthesis, SpeechSynthesisUtterance } = window;

/**
 * Speech synthesis using the Web Speech API.
 *
 * @copyright © Nick Freear, 10-Jan-2022.
 * @customElement my-text-to-speech
 * @demo https://codepen.io/nfreear/pen/eYKzbwJ
 * @see https://wicg.github.io/speech-api/#tts-section
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 * @see https://translate.google.com/?sl=auto&tl=zh-CN&text=Hello%20world.&op=translate;
 *
 * @was
 * <my-speech>
 * <my-speech-synthesis> - MySpeechSynthesisElement
 * <my-text-to-speech>   - MyTextToSpeechElement
 *
 * @status experimental
 * @since 1.X.0
 */
export class MyTextToSpeechElement extends HTMLElement {
  static getTag () {
    return 'my-text-to-speech'; // Was: 'my-speech-synthesis';
  }

  get pitch () { return parseFloat(this.getAttribute('pitch')) || 1; } // Default: 1; Range: 0-2;
  get rate () { return parseFloat(this.getAttribute('rate')) || 1; } // Default: 1; Range: 0.1-10;
  get volume () { return parseFloat(this.getAttribute('volume')) || 1; } // Default: 1; Range: 0-1;

  async connectedCallback () {
    const langRegex = this.getAttribute('lang-regex') || 'en.*';
    const voxRegex = this.getAttribute('vox-regex') || '(Fiona|Goo*UK Eng*Female)';
    const pitch = parseFloat(this.getAttribute('pitch')) || 1; // Default: 1; Range: 0-2;
    const rate = parseFloat(this.getAttribute('rate')) || 1; //   Default: 1; Range: 0.1-10;
    const volume = parseFloat(this.getAttribute('volume')) || 1; // Range: 0-1;

    await this.#initialize({ langRegex, voxRegex, pitch, rate, volume });
  }

  async #initialize (ATTR = {}) {
    attachTemplate(this.#htmlTemplate).to.shadowDOM(this);
    // Was: await this.getTemplate('my-text-to-speech');

    const utterElem = this.shadowRoot.querySelector('#utterance');
    const voxSelect = this.shadowRoot.querySelector('#vox select');
    const button = this.shadowRoot.querySelector('button');
    const log = this.shadowRoot.querySelector('#log');

    this.$$ = { ...ATTR, utterElem, voxSelect, button, log };

    button.addEventListener('click', ev => this._speak(null, ev));

    speechSynthesis.onvoiceschanged = this._addVoicesToSelect;

    setTimeout(() => this.#addVoicesToSelect(), 1500);

    console.debug('my-text-to-speech:', this);
    console.dir(this);
  }

  _speak (say = null, ev = null) {
    const ATTR = this.$$;
    const SAY = this.#getText(say);
    const VOX = this._findVoiceByName(ATTR.voxRegex); // /(Fiona|Goo*UK Eng*Female)/);

    const utterThis = new SpeechSynthesisUtterance(SAY);

    utterThis.lang = this.lang || 'en';
    utterThis.pitch = ATTR.pitch;
    utterThis.rate = ATTR.rate;
    utterThis.volume = ATTR.volume;
    utterThis.voice = VOX;

    speechSynthesis.speak(utterThis);

    console.debug('Speak:', SAY, utterThis, VOX, ev);
  }

  #getText (say = null) {
    const TEXT = this.textContent.replace(/[ \n]{2,}/g, '\n');
    const EL = this.$$.utterElem; // this.shadowRoot.querySelector('#utterance');
    // console.debug('Utter:', ELEM, ELEM.innerHTML, ELEM.content);
    // console.dir(this);
    return say || TEXT || EL.textContent; // .$$.utterElem.innerText; // .textContent
  }

  _filterVoicesByLang (langPattern = 'en.*') {
    const langRegex = new RegExp(langPattern, 'i');
    const VOX = speechSynthesis.getVoices();

    return VOX.filter(vox => langRegex.test(vox.lang));
  }

  _findVoiceByName (namePattern) {
    const nameRegex = new RegExp(namePattern, 'i');
    const VOX = speechSynthesis.getVoices();

    return VOX.find(vox => nameRegex.test(vox.name));
  }

  #addVoicesToSelect () {
    const ALL = /\?vox=all/.test(document.location.href);
    const SELECT = this.$$.voxSelect; // document.querySelector('#vox');
    const LOG = this.$$.log; // document.querySelector('#log');
    const VOICES = this._filterVoicesByLang(ALL ? '.*' : this.$$.langRegex);

    if (SELECT.children.length) {
      console.debug('Voices already loaded');
      return;
    }

    const VA = [];

    VOICES.forEach(vox => {
      const OPT = document.createElement('option');
      OPT.value = vox.voiceURI;
      OPT.textContent = `${vox.name}\t(${vox.lang})`;
      SELECT.appendChild(OPT);

      VA.push(OPT.textContent);
    });

    LOG.textContent = `Voices: ${VA.length}\n${VA.join('\n')}`;

    console.debug('Voices:', SELECT, VOICES);
  }

  // get #utterElem () { return this.shadowRoot.querySelector('#utterance'); }
  // get #button () { return this.shadowRoot.querySelector('button'); }

  get #stylesheet () {
    return `
  button,
  select {
    font: inherit;
    padding: .5rem;
  }
  button {
    padding: .2rem 2rem;
  }
  select {
    margin: 0 .5rem;
    min-width: 9rem;
    max-width: 100%;
  }
  pre {
    font-size: small;
    line-height: 1.2;
  }
  label,
  [ contenteditable = true ] {
    X-padding: 0 .2rem;
    outline-offset: .3rem;
  }
    `;
  }

  get #htmlTemplate () {
    return `
  <template>
    <style>${this.#stylesheet}</style>

    <div id="utterance" contenteditable="true" aria-label="Text to speak" part="utterance">
      <slot> Hello! You can edit me. </slot>
    </div>
    <!-- <textarea><slot></slot></textarea> -->

    <p>
      <label id="vox">Voice:<select></select></label>
      <button part="button"> Speak </button>
    </p>

    <details part="details">
      <summary> Voices </summary>
      <pre id="log"><pre>
    </details>
  </template>
`;
  }
}
