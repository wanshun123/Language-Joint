import Ember from 'ember';
import request from '../utils/request';

const {
  get,
  Logger: { error },
  inject: { service }
} = Ember;

export default Ember.Service.extend({

  languages: service(),

  id: null,

  localSpeechLanguage: 'en-US',

  remoteSpeechLanguage: 'de-DE',

  localLanguage: Ember.computed('localSpeechLanguage', function () {
    return this.get('languages').getLabel(this.get('localSpeechLanguage'));
  }),

  remoteLanguage: Ember.computed('remoteSpeechLanguage', function () {
    return this.get('languages').getLabel(this.get('remoteSpeechLanguage'));
  }),

  roomId: null,

  directToRoom: false,

  // hasBeenInRoom: false;

  initializeUser: function () {
    let userId = this.getFromSessionStorage();
    if (userId) {
      request('get', `/user/${userId}`).then(response => {
        if (response) {
          this.setProperties({
            'localSpeechLanguage': response.local_language,
            'remoteSpeechLanguage': response.remote_language,
            'roomId': response.room_id,
            'id': userId
          });
        }
      }, err => error(err));
    }
  },

  delete() {
    if (this.get('id')) {
      request('delete', `/user/${this.get('id')}`).then(() => {
        this.setProperties({
          id: null,
          roomId: null,
          directToRoom: null
        });
      });
    }
  },

  updateUser() {
    var data = { remote_language: get(this, 'remoteSpeechLanguage'), local_language: get(this, 'localSpeechLanguage') };
    let userId = this.get('id');
    return request('patch', `/user/${userId}`, data);
  },

  createUser() {
    var data = { remote_language: get(this, 'remoteSpeechLanguage'), local_language: get(this, 'localSpeechLanguage') };
    return request('post', `/user`, data);
  },

  getFromSessionStorage() {
    let sessionStorage = window.sessionStorage;
    return sessionStorage ? sessionStorage.getItem('user_id') : null;
  },

  pushToSessionStorage: Ember.observer('id', function () {
    let sessionStorage = window.sessionStorage;
    if (sessionStorage) {
      if(get(this, 'id')){
        sessionStorage.setItem('user_id', get(this, 'id'));
      } else {
        sessionStorage.removeItem('user_id');
      }
    }
  })

});
