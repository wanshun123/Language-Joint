import Ember from 'ember';
import request from '../utils/request';

const {
  get, set,
  inject: { service },
  Logger: { debug, error }
} = Ember;

export default Ember.Controller.extend({

  currentUser: service(),

  languages: service(),

  init: function() {
          let supports = {
            webRTC: !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection),
            webSpeech: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
            webAudio: !!window.AudioContext
          };
          if (!(supports.webRTC && supports.webSpeech && supports.webAudio)) {
              renderTemplate();
          }
  },

           renderTemplate: function() {
             this.render('error');
           },


  /**
  * This property holds the value of local speech language
  *
  * @property localSpeechLanguage
  * @type {string}
  * @default 'en-US'
  */

  localSpeechLanguage: Ember.computed.alias('currentUser.localSpeechLanguage'),


  /**
  * This property holds the value of remote speech language
  *
  * @property remoteSpeechLanguage
  * @type {string}
  * @default 'de-DE'
  */
  remoteSpeechLanguage: Ember.computed.alias('currentUser.remoteSpeechLanguage'),

  actions: {

    /**
    * This method creates user
    *
    * @method createUser
    */
    moveToWaitingRoom: function() {

      let currentUser = get(this, 'currentUser');
      currentUser.set('directToRoom', false);
      let userId = currentUser.get('id');

      // display alert if user chooses same 2 langauges
      let localLang = currentUser.get('localSpeechLanguage');
      let remoteLang = currentUser.get('remoteSpeechLanguage');

      if (localLang == remoteLang) {
        alert("Please select 2 different languages.");
      } else if(userId){
      $('#ownRoomButton').prop('disabled',true);
      $('#waitingRoomButton').prop('disabled',true);
       currentUser.updateUser().then(
       () => this.transitionToRoute('waiting-room'),
         err => error(err)
        );
         } else {
        $('#ownRoomButton').prop('disabled',true);
        $('#waitingRoomButton').prop('disabled',true);
         currentUser.createUser().then(
        (response) => {
        set(currentUser, 'id', response.user_id);
        this.transitionToRoute('waiting-room');
         },err => error(err)
         );
        }






    },

    partnerChat() {

    $('#ownRoomButton').prop('disabled',true);
    $('#waitingRoomButton').prop('disabled',true);

      let user = get(this, 'currentUser');

      let data = {
        user_id: user.get('id'),
        local_language: user.get('localSpeechLanguage'),
        remote_language: user.get('remoteSpeechLanguage')
      };

      request('post', '/partner-room', data).then((response) => {
        user.set('id', response.user_id);
        user.set('roomId', response.room_id);
        user.set('directToRoom', response.type === 'M');
        this.transitionToRoute('room', user.get('roomId'));
      });

    }
  }

});
