import Ember from 'ember';

export default Ember.Route.extend({

  currentUser: Ember.inject.service(),

  activate() {
    this.get('currentUser').delete();
  }
});
