import Ember from 'ember';

const {
  inject: { service },
  computed: { alias }
} = Ember;

export default Ember.Component.extend({

  currentUser: service(),
  languages: service(),

  isSpeechRecognitionActive: false,

  startRecognition: 'startRecognition',

  stopRecognition: 'stopRecognition',

  alternateState: Ember.computed('isSpeechRecognitionActive', function(){
    return this.get('isSpeechRecognitionActive') ? 'stop' : 'start';
  }),

  localLanguage: alias('currentUser.localLanguage'),

  availableLocales: null,

  alternateLang: null,

/*
        buttonLanguage: Ember.computed('isSpeechRecognitionActive', 'localLanguage', 'alternateLang', function(){
          this.get('localLanguage');
        }),
*/

  buttonLanguage: Ember.computed('isSpeechRecognitionActive', 'localLanguage', 'alternateLang', function(){
    return this.get('isSpeechRecognitionActive') ? this.get('localLanguage') : this.get('localLanguage');
  }),

  actions: {
    // TODO: Wait for local video to be on
    toggleRecognition: function () {
      if (this.get("isSpeechRecognitionActive")) {
        this.sendAction('stopRecognition');
      } else {
        this.sendAction('startRecognition');
      }
    }
  }
});
