import Ember from 'ember';
import ENV from '../config/environment';

export default function request(type, url, data) {
  return new Ember.RSVP.Promise((resolve, reject) => {
    let host = ENV.HOST;
    let config = {
      url: host + url,
      type: type,
      'content-type': 'application/json'
    };
    if(data){
      config.data = data;
    }
    let promise = Ember.$.ajax(config);
    promise.done(resolve);
    promise.fail(reject);
  });
}
