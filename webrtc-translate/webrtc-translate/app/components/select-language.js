import Ember from 'ember';

/**
* This component acts as the container for the select tag
*
* @class selectedLanguage
* @type {Ember.component}
*/
export default Ember.Component.extend({

  classNames: ['form-group'],

  /**
  * This property holds the label for select dropdown provided by the component
  * The label is always hidden via the bootstrap class sr-only
  *
  * @property label
  * @type {string}
  * @default null
  */
  label: null,

  /**
  * This property holds the value of selected language
  *
  * @property selectedLanguage
  * @type {string}
  * @default null
  */
  selectedLanguage: null,

  /**
  * This property contains the array of languages that needs to be displayed as
  * options under the select tag
  *
  * @property content
  * @type {Array}
  * @default null
  */
  content: null,

  didRender() {
    let options = this.$('select').children();
    let option = options.filter((index, option) => {
      return option.value && option.value.trim() === this.get('selectedLanguage');
    });
    if(option.length && option[0]){
      option[0].selected = true;
    }
  },

  actions: {
    /**
    * This action is responsible for propagating the language change
    *
    * @event selectionChanged
    */
    selectionChanged() {
      const changeAction = this.get("action");
      let options = this.$('select').children();
      let option = options.filter((index, option) => option.selected);
      if(option.length && option[0].value){
        let language = option[0].value.trim();
        changeAction(language);
      }
    }
  }
});
