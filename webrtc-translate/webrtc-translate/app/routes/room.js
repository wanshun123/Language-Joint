import Ember from 'ember';
import request from '../utils/request';

export default Ember.Route.extend({

  currentUser: Ember.inject.service(),

  beforeModel: function(transition) {
    let supports = {
      webRTC: !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection),
      webSpeech: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      webAudio: !!window.AudioContext
    };
    if (!(supports.webRTC && supports.webSpeech && supports.webAudio)) {
       transition.abort();
       console.log('bad');
       this.transitionTo('home');
    }

    // var audio = new Audio('/audio/beep.mp3');
    // audio.play();

    // currentUser: Ember.inject.service(),

    // localLanguageFixed: alias('currentUser.localSpeechLanguage'),
    // remoteLanguageFixed: alias('currentUser.remoteSpeechLanguage'),

  },

  model: function(params){
    let roomId = params.id;
    let userId = this.get('currentUser.id') || window.sessionStorage.getItem('user_id') || '';
    return request('get', `/validate_room/${roomId}?user_id=${userId}`).then(
      (response) => {
        this.get('currentUser').setProperties({
          id: response.user_id,
          roomId: response.room_id,
          directToRoom: response.type === 'M'
        });
        return Ember.Object.create({roomId: this.get('currentUser.roomId')});
      },
      () => Ember.Object.create({roomId: null})
    );
  },

  afterModel(model) {
    if(!model.get('roomId')){
      this.transitionTo('home');
    }
  },

  error(error) {
    Ember.Logger.error(error);
    this.transitionTo('waiting-room');
  }
});
