const express = require("express");
const app = express();
const cors = require("cors");
const parser = require("body-parser");
const jwt = require('jsonwebtoken');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
// io.set('transports', [ 'websocket' ]);

async function main() {

  app.use(cors())
  app.use(parser.urlencoded({ extended: true }))
  app.use(parser.json())

  app.get('/api', function (req, res) {
    res.send('Hello world!')
  })


  io.use((socket, next) => {
    var token = null;
    if (socket.handshake.headers['authorization']) {
      const header = socket.handshake.headers['authorization'];
      token = header.split(' ')[1];
    } else if (socket.handshake.query.token) {
      token = socket.handshake.query.token
    }
    console.log(token);
    if (isValidJwt(token)) {

      return next();
    }

    return next(new Error('authentication error'));
  });


  io.on('connection', (socket) => {
    console.log('a device connected')
    socket.on('disconnect', () => {
      console.log('device disconnected');
    });
  });


  const server = http.listen(process.env.PORT || 80, () => {
    console.log(`Server is litening on port ${server.address().port}`)
  })




}

const isValidJwt = (token) => {
  try {
    jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    return true;
  } catch (err) {
    console.log("err : ", err);
    return false;
  }
};

main()
