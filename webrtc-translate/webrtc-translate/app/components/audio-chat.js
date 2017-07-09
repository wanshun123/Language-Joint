import Ember from 'ember';
import WebrtcMixin from '../mixins/mixin-webrtc';
import SpeechRecognitionMixin from '../mixins/mixin-speech-recognition';

export default Ember.Component.extend(WebrtcMixin, SpeechRecognitionMixin, {

  currentUser: Ember.inject.service(),

  languages: Ember.inject.service(),

  availableLocales: null,

  roomId: null,

  chatMessage: null,

  moveToWaitingRoom: 'moveToWaitingRoom',

  directToRoom: Ember.computed.alias('currentUser.directToRoom'),

  localLanguage: Ember.computed.alias('currentUser.localLanguage'),

  alternateLang: Ember.computed('directToRoom', 'localLanguage', 'remoteSpeechLang', 'availableLocales', function(){
    if(this.get('directToRoom')) {
      return this.get('languages').getLanguages(this.get('remoteSpeechLang'));
    } else {
      return this.get('availableLocales').filter(language => language.label !== this.get('localLanguage'));
    }
  }),

  clientTranslationLanguage: Ember.computed('alternateLang.@each.key', function () {
    return this.get('alternateLang.0.key').split('-')[0];
  }),

  didInsertElement() {
    this._super(...arguments);
    this.get('messages').clear();
    this.setupWebrtc();
    this.setupRecoginiton();
  },

  /**
  * This method is responsible for speech synthesis of the remote users message
  * in local language
  *
  * @method say
  * @param opttions @type {Object}
  */
  say: function (options) {
  /*
    const msg = new window.SpeechSynthesisUtterance();
    msg.lang = options.lang;
    msg.text = options.text;
    window.speechSynthesis.speak(msg);
    */
  },

  setValues(json){
    let gettingDestroyed = this.get('isDestroyed') || this.get('isDestroying');
    if(!gettingDestroyed){
      this.setProperties(json);
    }
  },

  actions: {

    /**
    * Moves the user to the waiting room, after closing the current chat session
    *
    * @event moveToWaitingRoom
    */
    moveToWaitingRoom() {
        Ember.Logger.debug('move to waitinf room for components/audio-chat.js');
      this.sendAction('moveToWaitingRoom');
    }
  },

  willDestroyElement: function(){
    this.leaveRoom();
    this._super(...arguments);
  }
});
