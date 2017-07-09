import Ember from "ember";

/**
* This component holds single chat message. This component is responsible for
* displaying the chat of local user on left and remote user on right.
*
* @class MessageItem
* @type {Ember.Computed}
*/
export default Ember.Component.extend({
  classNames: ['message'],
  classNameBindings: ['message.isRemote:remote:local']
});
