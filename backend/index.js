const express = require("express");
const app = express();
const cors = require("cors");
var mysql = require('mysql');
const parser = require("body-parser");
const jwt = require('jsonwebtoken');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
// io.set('transports', [ 'websocket' ]);

const fs = require('fs');




async function main() {
  var currentConnections = {};

  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  app.use(cors())
  app.use(parser.urlencoded({ extended: true }))
  app.use(parser.json())

  const authRoute = require("./route/auth");
  const camerasRoute = require("./route/cameras");
  const notificationsRoute = require("./route/notifications");

  app.use("/api/auth", authRoute);
  app.use("/api/cameras", camerasRoute);
  app.use("/api/notifications", notificationsRoute);


  app.get('/api', function (req, res) {
    res.send('Hello world!')
  })


  // io.on('connection', socket => {
  //   if (!users[socket.id]) {
  //     users[socket.id] = socket.id;
  //   }
  //   socket.emit("yourID", socket.id);
  //   io.sockets.emit("allUsers", users);
  //   socket.on('disconnect', () => {
  //     delete users[socket.id];
  //   })

  //   socket.on("callUser", (data) => {
  //     io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
  //   })

  //   socket.on("acceptCall", (data) => {
  //     io.to(data.to).emit('callAccepted', data.signal);
  //   })

  var winston = require('winston');

  // io.set('logger', winston);

  // io.configure('production', function () {
  //   io.set('log level', 1);
  // })

  var io_devices = io.of('/devices');
  var io_interface = io.of('/interface');

  // io_interface.set('logger', winston);


  io_interface.use((socket, next) => {
    console.log("Tentative co interface");
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


  io_devices.use((socket, next) => {
    console.log("Tentative co device");
    var token = null;
    if (socket.handshake.headers['authorization']) {
      const header = socket.handshake.headers['authorization'];
      token = header.split(' ')[1];
    } else if (socket.handshake.query.token) {
      token = socket.handshake.query.token
    }
    console.log(token);
    const validToken = isValidJwt(token)
    if (validToken && validToken.camera) {
      socket.cameraId = validToken.camera
      return next();
    }

    return next(new Error('authentication error'));
  });


  // io_devices.use((socket, next) => {
  //   console.log("Device test co : ");

  //   var token = null;
  //   if (socket.handshake.headers['authorization']) {
  //     const header = socket.handshake.headers['authorization'];
  //     token = header.split(' ')[1];
  //   } else if (socket.handshake.query.token) {
  //     token = socket.handshake.query.token
  //   }
  //   console.log("Avec token", token);

  //   if (token == "azertyuiop") {
  //     console.log("TRUE");
  //     return next();
  //   }
  //   return next(new Error('authentication error'));
  // });

  io_devices.on('connection', (socket) => {
    console.log('a device connected');
    currentConnections[socket.cameraId] = socket.id;


    socket.on('acceptCall', async data => {
      console.log(data);
      io_interface.to(data.to).emit("callAccepted", data.signal)
    });

    socket.on('acceptCall3', async data => {
      console.log(data);
    });

    socket.on('acceptCall2', async data => {
      console.log();
      console.log();
      console.log("----------------------------------------");
      // console.log(data);
      console.log();
      console.log();

      fs.writeFile('/temp/nouveauFichier.jpg', data, function (err) {

        if (err) throw err;

        console.log('Fichier créé !');

      });
    });

    // io_devices.to(socket.id).emit("call", "t")

    socket.on('disconnect', () => {
      delete currentConnections[socket.id];
      console.log('device disconnected');
    });

    socket.emit('stream')

  });

  io_interface.on('connection', (socket) => {
    console.log('an interface connected')
    console.log(currentConnections);
    socket.on('callCamera', async data => {
      console.log(data);
      console.log("Calling : ", currentConnections[data.cameraToCall]);
      io_devices.to(currentConnections[data.cameraToCall]).emit("call", {
        from: socket.id,
        signal: data.signalData
      })
    });



    socket.on('disconnect', () => {
      console.log('interface disconnected');
    });
  });



  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

    setInterval(() => {
      con.query('select 1 + 1', (err, rows) => { /* */ });
    }, 30000)


    app.locals.db = con;


    const server = http.listen(process.env.PORT || 80, () => {
      console.log(`Server is litening on port ${server.address().port}`)
    })


  })

}

const isValidJwt = (token) => {
  try {
    var decoded = jwt.verify(token, process.env.JWT_KEY);
    return decoded;
  } catch (err) {
    // console.log("err : ", err);
    return false;
  }
};

main()
