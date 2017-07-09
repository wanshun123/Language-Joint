var mysql = require('mysql');
var databaseConfig = require("../config/database.json");

var pool = mysql.createPool(databaseConfig);

query = 'CREATE TABLE IF NOT EXISTS users (' +
  'id int(8) NOT NULL AUTO_INCREMENT, ' +
  'local_language varchar(45) NOT NULL, ' +
  'remote_language varchar(45) NOT NULL, ' +
  'room_id varchar(45) DEFAULT NULL, ' +
  'locked_by int(8) DEFAULT NULL, ' +
  'updated_at datetime NOT NULL, ' +
  'waiting_since datetime DEFAULT NULL, ' +
  'type varchar(45) DEFAULT \'A\', ' +
  'PRIMARY KEY (id), ' +
  'UNIQUE KEY locked_by_UNIQUE (locked_by))';

function databaseQueries(query, message) {
  pool.getConnection(function (error, connection) {
    if (error || !connection) {
      console.error(error);
    } else {
      connection.release();
      connection.query(query, function (err, resp) {
        if (err) {
          console.error(err);
        } else {
          console.log(message);
        }
      });
    }
  });
}

// databaseQueries('DROP TABLE IF EXISTS users', 'Existing user table dropped');
databaseQueries(query, 'User table is created');

module.exports = pool;
