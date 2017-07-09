var userRoute = require('./routes/user');
var roomRoute = require('./routes/room');

module.exports = function (app) {
  userRoute(app);
  roomRoute(app);
};
