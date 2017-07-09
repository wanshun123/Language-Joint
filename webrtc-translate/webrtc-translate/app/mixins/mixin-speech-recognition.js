import Ember from 'ember';
import Message from '../models/message';

const {
  Logger: { debug }
} = Ember;

export default Ember.Mixin.create({

  currentUser: Ember.inject.service(),

  isActive: false,

  /**
  * This property contains an empty speech message object, which eventually gets
  * filled with the current speech message
  *
  * @property speechMessage
  * @type {Object}
  * @default Message
  */
  speechMessage: Message.create(),

  recognition: Ember.computed('', function () {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.get('currentUser.localSpeechLanguage');
    return recognition;
  }),

  setupRecoginiton() {
    const recognition = this.get('recognition');
    recognition.onstart = Ember.run.bind(this, this.onRecognitionStart);
    recognition.onresult = Ember.run.bind(this, this.onRecognitionResult, recognition);
    recognition.onend = Ember.run.bind(this, this.onRecognitionEnd);
    recognition.onerror = Ember.run.bind(this, this.onRecognitionError);
  },

  onRecognitionStart() {
    Ember.Logger.debug('recognition:start');
    this.set('isActive', true);
    // this.send('start');
  },

  onRecognitionEnd() {
    Ember.Logger.debug('recognition:end', event);
    this.set('isActive', false);
  },

  onRecognitionError(event) {
    Ember.Logger.debug('recognition:error', event);
    this.set('isActive', false);
  },

  /**
  * This method is triggered when there is some result from the speech recognition
  *
  * @method recognition
  * @param event @type {Event}
  */
  onRecognitionResult(recognition, event) {
    let finalTranscript = '';
    let interimTranscript = '';
    let messages = this.get('messages');
    let message = this.get('speechMessage');

    Ember.Logger.debug('recognition:result', event);
    let results = event.results || [];
    if (results.length && results[0].isFinal) {
      // recognition.abort();
      // commenting out recognition.abort(); will make the speech recognition continue fine
    }

    if(messages.indexOf(message) === -1){
      messages.pushObject(message);
    }
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript = result[0].transcript;
        debug("Final: ", finalTranscript);
        break;
      } else {
        interimTranscript += result[0].transcript;
        debug("Interim: ", interimTranscript);
      }
    }
    message.set('originalContent', interimTranscript);
    if (finalTranscript) {
      message.setProperties({
        originalContent: finalTranscript,
        isFinal: true
      });
    }
    if(message.get('isFinal')){
      this.handleMessageTranslation(message)
      .finally(() => {
        finalTranscript = '';
        interimTranscript = '';
        this.set('speechMessage', Message.create());
      });
    }
    debug(event.results);
  },


  actions: {

    startRecognition() {
      this.get('recognition').start();
    },

    stopRecognition() {
      this.get('recognition').stop();
    }
  },

  /**
  * This is an observer which triggers whenever the local language selected
  * changes. And stops the speech recognition, if the speech recognition is
  * active
  *
  * @method languageHasChanged
  * @type {Ember.observer}
  */
  languageHasChanged: Ember.observer('currentUser.localSpeechLanguage', function () {
    var language = this.get('currentUser.localSpeechLanguage');
    var recognition = this.get('recognition');
    if (this.get('isActive')) {
      recognition.stop();
    }
    recognition.lang = language;
  })

});
