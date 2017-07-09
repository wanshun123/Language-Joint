import Ember from 'ember';

export default Ember.Service.extend({


  languages: [
  {
      "key": "en-US",
      "label": "English"
    },
    {
      "key": "fr-FR",
      "label": "French"
    },
    {
      "key": "de-DE",
      "label": "German"
    },
    {
      "key": "it-IT",
      "label": "Italian"
    },
    {
      "key": "pt-PT",
      "label": "Portuguese"
    },
    {
      "key": "es-ES",
      "label": "Spanish"
    },
    {
      "key": "ru-RU",
      "label": "Russian [Русский]"
    },
    {
      "key": "zh-CN",
      "label": "Chinese [中国大陆]"
    },
    {
      "key": "ja-JP",
      "label": "Japanese [日本語]"
    },
    {
      "key": "ko-KR",
      "label": "Korean [한국어]"
    },
    {
    "key": "hi-IN",
    "label": "Hindi [हिंदी]"
    },
    {
    "key": "ar-EG",
    "label": "Egyptian Arabic [عربى]"
    },
  ],




  getLabel(key) {
    if(!key){
      return '';
    }
    let language = this.get('languages').findBy('key', key);
    return language && language.label || '';
  },

  vowels: ['a', 'e', 'i', 'o', 'u'],

  isVowel(language) {
    if(!language){
      return false;
    }
    return this.get('vowels').indexOf(language.toLowerCase().charAt(0)) !== -1;
  },

  getLanguages(keys){
    if(keys && keys.length) {
      let languages = this.get('languages');
      return languages.filter(lang => keys.indexOf(lang.key) !== -1);
    } else {
      return [];
    }
  }
});
