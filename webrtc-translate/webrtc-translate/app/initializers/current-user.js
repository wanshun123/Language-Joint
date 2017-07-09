export function initialize(app) {
  const { __container__ = app } = app;
  const myService = __container__.lookup('service:current-user');
  myService.initializeUser();
}

export default {
  name: 'current-user',
  initialize: initialize
};
