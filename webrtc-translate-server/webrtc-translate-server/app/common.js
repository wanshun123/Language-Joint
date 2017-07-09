module.exports = {
  uuid: function () {
    return 'xxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  handleResponse: function (error, res, callback) {
    if (error) {
      console.log(error);
      res.status(422).send(error);
    } else {
      callback();
    }
  },

  checkIfNumber: function (value) {
    return value && !isNaN(parseInt(value));
  },

  executeOnConnection: function (pool, res, callback) {
    pool.getConnection(function (error, connection) {
      if (!connection) {
        res.sendStatus(500);
      } else {
        connection.release();
        if (error) {
          res.sendStatus(500);
        } else {
          callback(connection);
        }
      }
    });
  },

  handlePatchResponse: function (err, res) {
    this.handleResponse(err, res, function () {
      res.sendStatus(202);
    });
  }
};
