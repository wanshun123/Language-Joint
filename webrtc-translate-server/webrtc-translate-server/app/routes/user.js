var pool = require('../connection');
var common = require('../common');

module.exports = function (app) {

  app.post('/user', function (req, res) {
    var localLanguage = req.body.local_language;
    var remoteLanguage = req.body.remote_language;
    if (localLanguage && remoteLanguage) {
      common.executeOnConnection(pool, res, function (connection) {
        var query = 'INSERT INTO users (local_language, remote_language, updated_at, waiting_since) VALUES(?, ?, NOW(), NOW())';
        connection.query(query, [localLanguage, remoteLanguage], function (err, response) {
          common.handleResponse(err, res, function () {
            res.type('application/json').status(201).json({ user_id: response.insertId });
          });
        });
      });
    } else {
      res.sendStatus(400);
    }
  });

  app.patch('/user/:id', function (req, res) {
    var userId = req.params.id;
    var localLanguage = req.body.local_language;
    var remoteLanguage = req.body.remote_language;
    if (localLanguage && remoteLanguage && common.checkIfNumber(userId)) {
      common.executeOnConnection(pool, res, function (connection) {
        connection.query('UPDATE users SET local_language=?, remote_language=?, updated_at=NOW(), waiting_since=NOW(), locked_by=NULL, type=\'A\' WHERE id=?', [localLanguage, remoteLanguage, userId], function (err, response) {
          common.handlePatchResponse(err, res, connection);
        });
      });
    } else {
      res.sendStatus(400);
    }
  });

  app.get('/user/:id', function (req, res) {
    var userId = req.params.id;
    if (common.checkIfNumber(userId)) {
      common.executeOnConnection(pool, res, function (connection) {
        connection.query('select local_language, remote_language, room_id, type from users where id = ?', [userId], function (err, rows) {
          common.handleResponse(err, res, function () {
            if (rows && rows.length) {
              res.type('application/json').status(200).json(rows[0]);
            } else {
              res.sendStatus(403);
            }
          });
        });
      });
    } else {
      res.sendStatus(400);
    }
  });

  app.delete('/user/:id', function (req, res) {
    var user_id = req.params.id;
    if (common.checkIfNumber(user_id)) {
      common.executeOnConnection(pool, res, function (connection) {
        connection.query('DELETE FROM users WHERE id=?', [user_id], function (err, response) {
          common.handleResponse(err, res, function () {
            res.sendStatus(201);
          });
        });
      });
    } else {
      res.sendStatus(400);
    }
  });
};
