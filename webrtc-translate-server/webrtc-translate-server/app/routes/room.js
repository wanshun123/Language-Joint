var pool = require('../connection');
var common = require('../common');

var updateRoomQuery = function (roomId) {
  return 'UPDATE users a JOIN ' +
    '(SELECT b.id, b.local_language, b.remote_language, b.room_id, b.locked_by, b.updated_at, b.type from users b JOIN users c ' +
    'where b.remote_language=c.local_language AND b.local_language=c.remote_language AND b.locked_by IS null ' +
    'AND b.room_id IS NULL AND b.updated_at > (NOW() - INTERVAL 30 SECOND) AND c.room_id IS NULL AND c.id = ? ' +
    'order by b.waiting_since limit 1) d ' +
    'SET a.locked_by = (CASE WHEN a.id=? then d.id ' +
    'WHEN a.id=d.id then ? ' +
    'end), ' +
    'a.updated_at = Now(), ' +
    'a.room_id = "' + roomId + '" ' +
    'where a.id IN (?, d.id) AND a.locked_by IS NULL AND a.room_id IS NULL;';
};

function partnerUpdateQuery() {
  return 'UPDATE users a LEFT JOIN ' +
    '(SELECT id, local_language, remote_language, room_id, locked_by, updated_at, type from users where locked_by = ?) b ' +
    'ON a.id = b.id ' +
    'SET a.room_id =IF(a.id=?, ?, null), ' +
    'a.locked_by=null, ' +
    'a.updated_at=NOW(), ' +
    'a.waiting_since=NOW(), ' +
    'a.type=IF(a.id=?, ?, \'A\') ' +
    'WHERE a.id IN(?, b.id)';
}

module.exports = function (app) {
  function updateWaiting(res, userId) {
    common.executeOnConnection(pool, res, function (connection) {
      connection.query('UPDATE users SET updated_at=NOW() WHERE id=?', [userId], function (err) {
        common.handleResponse(err, res, function () {
          res.type('application/json').status(200).json({ room_id: null });
        });
      });
    });
  }

  function updateRoomId(userId, res) {
    var roomId = common.uuid();
    common.executeOnConnection(pool, res, function (connection) {
      connection.query(updateRoomQuery(roomId), [userId, userId, userId, userId], function (err, response) {
        common.handleResponse(err, res, function () {
          if (response && response.affectedRows === 2) {
            res.type('application/json').status(200).json({ room_id: roomId });
          } else {
            updateWaiting(res, userId);
          }
        });
      });
    });
  }

  function getRoomId(user_id, res) {
    common.executeOnConnection(pool, res, function (connection) {
      connection.query('select id, room_id, type from users where id=?', [user_id], function (err, rows) {
        common.handleResponse(err, res, function () {
          res.status(200).json({ room_id: rows[0].room_id, user_id: rows[0].id, type: rows[0].type });
        });
      });
    })
  }

  function updatePartnerRoomId(user_id, room_id, type, res) {
    common.executeOnConnection(pool, res, function (connection) {
      connection.query(partnerUpdateQuery(), [user_id, user_id, room_id, user_id, type, user_id], function (err, response) {
        common.handleResponse(err, res, function () {
          res.status(200).json({ room_id: room_id, user_id: user_id, type: type });
        });
      });
    });
  }

  app.get('/get_room/:id', function (req, res) {
    var userId = req.params.id;
    if (common.checkIfNumber(userId)) {
      common.executeOnConnection(pool, res, function (connection) {
        connection.query('SELECT room_id FROM users WHERE id=?', [userId], function (err, rows) {
          common.handleResponse(err, res, function () {
            if (rows && rows.length && rows[0].room_id) {
              res.type('application/json').status(200).json({ room_id: rows[0].room_id });
            } else {
              updateRoomId(userId, res);
            }
          });
        });
      });
    } else {
      res.sendStatus(400);
    }
  });

  app.get('/leave_room/:id', function (req, res) {
    var roomId = req.params.id;
    var userId = req.query.user_id;
    if (roomId && common.checkIfNumber(userId)) {
      common.executeOnConnection(pool, res, function (connection) {
        var query = 'UPDATE users SET locked_by=NULL, updated_at=NOW(),' +
          'room_id=IF(id=?, NULL, room_id), type=IF(id=?, \'A\', type), ' +
          'waiting_since=IF(id=?, NOW(), waiting_since)' +
          'WHERE room_id=?';
        connection.query(query, [userId, userId, userId, roomId], function (err, resp) {
          common.handleResponse(err, res, function () {
            res.sendStatus(204);
          });
        });
      });
    } else {
      res.sendStatus(400);
    }
  });

  app.get('/validate_room/:id', function (req, res) {
    var room_id = req.params.id;
    var user_id = req.query.user_id;
    if (room_id) {
      common.executeOnConnection(pool, res, function (connection) {
        if (user_id) {
          var query = 'SELECT id, room_id, type FROM users WHERE room_id=? or id=?';
          connection.query(query, [room_id, user_id], function (err, rows) {
            if (rows && rows.length && rows.length < 3) {
              if (rows.length === 2 && rows[0].room_id === rows[1].room_id) {
                res.status(200).json({ room_id: rows[0].room_id, user_id: parseInt(user_id), type: rows[0].type });
              } else if (rows.length === 1 && rows[0].id === parseInt(user_id)) {
                res.status(200).json({ room_id: rows[0].room_id, type: rows[0].type, user_id: parseInt(user_id) });
              } else {
                var row = rows.find(function (row) {
                  return row.room_id === room_id;
                });
                updatePartnerRoomId(user_id, room_id, row.type, res);
              }
            } else {
              res.sendStatus(403);
            }
          });
        } else {
          var query = 'INSERT INTO users(local_language, remote_language, room_id, updated_at, waiting_since, type) SELECT \'en-GB\', \'de-DE\', ? , NOW(), NOW(), type from users where room_id=? and (Select count(room_id) from users where room_id=?)=1';
          connection.query(query, [room_id, room_id, room_id], function (err, response) {
            common.handleResponse(err, res, function () {
              if (response.insertId) {
                getRoomId(response.insertId, res);
              } else {
                res.sendStatus(403);
              }
            });
          });
        }
      });
    } else {
      res.sendStatus(400);
    }
  });

  app.post('/partner-room', function (req, res) {
    var user_id = req.body.user_id;
    var local_language = req.body.local_language || 'en-GB';
    var remote_language = req.body.remote_language || 'de-DE';
    var room_id = common.uuid();
    common.executeOnConnection(pool, res, function (connection) {
      var query = 'INSERT INTO users (local_language, remote_language, updated_at, waiting_since, type, room_id) VALUES(?, ?, NOW(), NOW(), \'M\', ?)';
      if (user_id) {
        query = 'UPDATE users SET local_language=?, remote_language=?, updated_at=NOW(), type=\'M\', room_id=?, locked_by=null where id=' + connection.escape(user_id);
      }
      connection.query(query, [local_language, remote_language, room_id], function (err, response) {
        common.handleResponse(err, res, function () {
          var json = {
            user_id: user_id || response.insertId,
            room_id: room_id,
            type: 'M',
            local_language: local_language,
            remote_language: remote_language
          }
          res.status(200).json(json);
        });
      });
    });

  });
};
