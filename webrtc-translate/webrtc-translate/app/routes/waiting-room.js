import Ember from 'ember';

export default Ember.Route.extend({

  currentUser: Ember.inject.service(),

  getRoom: Ember.on('activate', function(){
    let controller = this.controllerFor('waiting-room');
    Ember.run.scheduleOnce('afterRender', controller, function(){
      controller.getRoom();
    });
  }),

  stopRoomRequest: Ember.on('deactivate', function(){
    let controller = this.controllerFor('waiting-room');
    if(controller._roomRequest){
      Ember.run.cancel(controller._roomRequest);
    }
  })
});
