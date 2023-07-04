import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { userRouter } from './src/router/user.routes.js';
import { loginRouter } from './src/router/login.routes.js';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import { readFile, writeFile } from './src/utils/fs.js';
import { imgMsgRouter } from './src/router/imgMsg.routes.js';

dotenv.config();
const PORT = process.env.PORT || 9000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// EXPRESS

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(process.cwd() + '/public'));
app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
  })
);

// FRONT

app.set('view engine', 'ejs');
app.get('/signup', (req, res) => res.render('signup'));
app.get('/signin', (req, res) => res.render('signin'));
app.get('/', (req, res) => res.render('index'));

// BACK

app.get('/download/:file', (req, res) => {
  res.download(process.cwd() + '/public/' + req.params?.file);
});

let finder;

app.use('/register', userRouter);
app.use('/login', loginRouter);
app.use('/img_msg', imgMsgRouter);

// SOCKET

io.use(function (socket, next) {
  var handshakeData = socket.request;

  socket.userId = handshakeData._query['userId'];
  next();
});

io.on('connection', (socket) => {
  const messages = JSON.parse(readFile('/data/messages.json'));
  let users = JSON.parse(readFile('/data/users.json')) || [];
  const images = JSON.parse(readFile('/data/images.json')) || [];

  users = users.map((user) => {
    if (user.id == socket.userId) {
      user.isOnline = true;
      delete user.lastOnline;
    }

    return user;
  });

  writeFile('/data/users.json', users);

  const filtered = users.filter((item) => {
    item.images = [];

    for (let i of images) {
      if (i.user_id == item.id) {
        item.images.push(i);
        delete i.user_id;
      }
    }

    return item;
  });

  io.emit('users', filtered);
  socket.emit('message', messages);

  socket.on('msg', (chunk) => {
    const messages = JSON.parse(readFile('/data/messages.json'));
    messages.push({
      id: messages.at(-1)?.id + 1 || 1,
      user: chunk.user,
      message: chunk.msg,
      time: chunk.time,
      user_img: chunk.user_img,
    });

    writeFile('/data/messages.json', messages);
    io.emit('message', messages);
  });

  socket.on('disconnect', () => {
    let users = JSON.parse(readFile('/data/users.json')) || [];
    const images = JSON.parse(readFile('/data/images.json')) || [];

    users = users.map((user) => {
      if (user.id == socket.userId) {
        user.isOnline = false;
        user.lastOnline = Date.now();
      }

      return user;
    });

    writeFile('/data/users.json', users);

    const filtered = users.filter((item) => {
      item.images = [];

      for (let i of images) {
        if (i.user_id == item.id) {
          item.images.push(i);

          delete i.user_id;
        }
      }

      return item;
    });

    io.emit('users', filtered);
  });
});

httpServer.listen(
  PORT,
  console.log('Server is run in port: http://localhost:' + PORT)
);
