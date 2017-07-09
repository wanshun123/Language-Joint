import Ember from "ember";

/**
* This component is the container for all the chat messages
*
* @class MessageItem
* @type {Ember.Component}
*/
export default Ember.Component.extend({
  classNames: ['chat'],
  
  /**
  * This property holds all the local and remote messages
  *
  * @property messages
  * @type {Array}
  * @default []
  */
  messages: [],

  /**
  * This observer is responsible for scrolling to the latest chat message
  *
  * @method scrollChatToBottom
  * @type {Ember.observer}
  */
  scrollChatToBottom: Ember.observer('messages.[]', function () {
    const element = this.$();
    // Wait till the view is updated
    if (element) {
      Ember.run.schedule('afterRender', function () {
        element.scrollTop(element.prop('scrollHeight'));
      });
    }
  })
});
