# Language-Joint

## About this repository

This repository contains the code which acts as server side code for (webrtc-translate)[https://github.com/wanshun123/Language-Joint].

## Prerequisites

* node >= 4.5.0
* (ExpressJS)[https://expressjs.com/]
* (mysql)[https://github.com/mysqljs/mysql]
* (body-parser)[https://github.com/expressjs/body-parser]

## Configuration file

There is only one configuration file, `database.json` present under `config` folder.

The structure of `database.json` file is presented below

```javascript
{
  "connectionLimit": 10, //default
  "host": "host where the sql is present",
  "port": 3306, //default
  "user": "username",
  "password": "password",
  "database": "name of the database to which the connections should be made"
}
```

## Installing and running the server

1. Goto the client repository
2. Run the command `ember build --environment=production`
3. Goto the generated dist folder under the client repository
4. Copy and replace all the files from dist folder to the public folder of webrtc-translate-server repository
5. Run `npm install` inside the webrtc-translate-server repository
6. Run `node server.js` from the root of webrtc-translate-server repository
7. If `process.env.PORT` is not set, then a server hosting at port `3000` should start up
