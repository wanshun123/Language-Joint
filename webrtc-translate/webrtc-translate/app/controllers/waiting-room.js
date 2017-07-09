import Ember from 'ember';
import request from '../utils/request';

const {
  set,
  run: { later },
  Logger: { error },
  inject: { service }
} = Ember;

/**
* This contorller is responsible for getting a room for the user and also.
*
* @class WaitingRoom
* @type {Ember.Controller}
*/
export default Ember.Controller.extend({

  currentUser: service(),

  languages: service(),

  articleToBeUsed: Ember.computed('currentUser.remoteLanguage', function(){
    return this.get('languages').isVowel(this.get('currentUser.remoteLanguage')) ? 'an' : 'a';
  }),

  /**
  * This method is responsible for getting the room information from the server.
  * Till a room is allocated, this method will continously be invoked in every
  * five seconds
  *
  * @method getRoom
  */
  getRoom: function(){
    let userId = this.getUserId();
    request('get', `/get_room/${userId}`).then(response => {
      if(response && response.room_id){
        set(this, 'currentUser.room_id', response.room_id);
        this.transitionToRoute('room', response.room_id);
        var audio = new Audio('/audio/beep.mp3');
        audio.play();
      } else {
        this._roomRequest = later(this, this.getRoom, 2000);
      }
    }, err => error(err));
  },

/*
      updateUser: function(){
        var self = this;
        let userId = this.getUserId();

        request('updatetime', `/get_room/${userId}`).then(response => {

        }, err => error(err));

        run.later(function(){
          self.updateUser();
        }, 10000);
      },

*/
  /**
  * This method returns the id of the current user
  *
  * @method getUserId
  * @return id @type {integer}
  */
  getUserId: function(){
    return this.get('currentUser.id') || window.sessionStorage.getItem('user_id');
  }

});
