import Ember from 'ember';
import MixinWebrtcMixin from '../../../mixins/mixin-webrtc';
import { module, test } from 'qunit';

module('Unit | Mixin | mixin webrtc');

// Replace this with your real tests.
test('it works', function(assert) {
  var MixinWebrtcObject = Ember.Object.extend(MixinWebrtcMixin);
  var subject = MixinWebrtcObject.create();
  assert.ok(subject);
});
