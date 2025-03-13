/**
 * Speech synthesis using the Web Speech API.
 *
 * @copyright © Nick Freear, 10-Jan-2022.
 *
 * @see https://codepen.io/nfreear/pen/eYKzbwJ
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

import { MyElement } from '../MyElement.js';

const { speechSynthesis, SpeechSynthesisUtterance } = window;

export class MyTextToSpeechElement extends MyElement {
  static getTag () {
    return 'my-text-to-speech'; // Was: 'my-speech-synthesis';
  }

  /* constructor () { // "Useless constructor"!
    super();
  } */

  async connectedCallback () {
    const langRegex = this.getAttribute('lang-regex') || 'en.*';
    const voxRegex = this.getAttribute('vox-regex') || '(Fiona|Goo*UK Eng*Female)';
    const pitch = parseFloat(this.getAttribute('pitch')) || 1; // Default: 1; Range: 0-2;
    const rate = parseFloat(this.getAttribute('rate')) || 1; //   Default: 1; Range: 0.1-10;
    const volume = parseFloat(this.getAttribute('volume')) || 1; // Range: 0-1;

    await this._initialize({ langRegex, voxRegex, pitch, rate, volume });
  }

  async _initialize (ATTR = {}) {
    await this.getTemplate('my-text-to-speech');

    const utterElem = this.shadowRoot.querySelector('#utterance');
    const voxSelect = this.shadowRoot.querySelector('#vox select');
    const button = this.shadowRoot.querySelector('button');
    const log = this.shadowRoot.querySelector('#log');

    this.$$ = { ...ATTR, utterElem, voxSelect, button, log };

    button.addEventListener('click', ev => this._speak(null, ev));

    speechSynthesis.onvoiceschanged = this._addVoicesToSelect;

    setTimeout(() => this._addVoicesToSelect(), 1500);

    console.debug('my-text-to-speech:', this);
    console.dir(this);
  }

  _speak (say = null, ev = null) {
    const ATTR = this.$$;
    const SAY = this._getText(say);
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

  _getText (say = null) {
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

  _addVoicesToSelect () {
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
}
