import Ember from 'ember';
import MixinSpeechRecognitionMixin from '../../../mixins/mixin-speech-recognition';
import { module, test } from 'qunit';

module('Unit | Mixin | mixin speech recognition');

// Replace this with your real tests.
test('it works', function(assert) {
  var MixinSpeechRecognitionObject = Ember.Object.extend(MixinSpeechRecognitionMixin);
  var subject = MixinSpeechRecognitionObject.create();
  assert.ok(subject);
});
