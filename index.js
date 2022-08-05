const express = require('express');
const app = express();
const server = require('http').createServer(app);
const http = require('http');
const { userInfo } = require('os');
const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const  db = require('./db.js')
db.initDB()
const manageWebsockets = require('./webscoket/websocket')
require('dotenv').config({
    path: './'
})

app.use(express.json());
app.all("/*", function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, x-access-token");
    return next();
  })
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  manageWebsockets(ws)
});

app.use('/user', require('./api/user'));

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
