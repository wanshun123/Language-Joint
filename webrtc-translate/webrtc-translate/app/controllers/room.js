import Ember from 'ember';
import request from '../utils/request';

const  {
  computed: { alias },
  inject: { service },
  Logger: { error }
} = Ember;

/**
* This controller is responsible for maintaing the flow of data for the room view
*
* @class Room
* @type {Ember.Controller}
*/
export default Ember.Controller.extend({

  currentUser: service(),

  languages: service(),

  status: null,

  /**
  * This property holds the value of local speech language
  *
  * @property localSpeechLanguage
  * @type {string}
  */
  localSpeechLanguage: alias('currentUser.localSpeechLanguage'),

  /**
  * This property holds the value of remote speech language
  *
  * @property remoteSpeechLanguage
  * @type {string}
  */
  remoteSpeechLanguage: alias('currentUser.remoteSpeechLanguage'),

  languagesToToggle: Ember.computed('currentUser.directToRoom', function(){
    return this.get('currentUser.directToRoom') ? this.get('languages.languages') : this.get('languages').getLanguages([this.get('localSpeechLanguage'), this.get('remoteSpeechLanguage')]);
  }),

  localTranslationLanguage: Ember.computed('localSpeechLanguage', function(){
    return this.get('localSpeechLanguage').split('-')[0];
  }),

  remoteTranslationLanguage: Ember.computed('remoteSpeechLanguage', function(){
    return this.get('remoteSpeechLanguage').split('-')[0];
  }),

  leaveRoom(transitionTo) {
    var userId = this.get('currentUser.id');
    var roomId = this.get('currentUser.roomId');
    request('get', `/leave_room/${roomId}?user_id=${userId}`).then(() => {
      this.set('currentUser.roomId', null);
      this.set('currentUser.directToRoom', false);
      this.transitionToRoute(transitionTo);
    }, (err) => error(err));
  },

  actions: {

    /**
    * Moves the user to the waiting room, after closing the current chat session
    *
    * @event moveToWaitingRoom
    */
    moveToWaitingRoom() {

      Ember.Logger.debug('move to waitinf room for controllers/room.js');

      // currentUser.localTranslationLanguage = currentUser.localLanguage;

      this.leaveRoom('waiting-room');
    },

    returnHome() {
      this.leaveRoom('home');
    }
  }

});
