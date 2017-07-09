import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {
  this.route('home', {path: '/'});
  this.route('room', {path: '/:id'});
  this.route('waiting-room');
});

export default Router;
