const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const {SYSTEM_MESSAGE_NAME} = require('./config/config');

let app = express();

let server = http.createServer(app);

let io = socketIO(server);

let users = new Users();

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('new user connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.email) || !isRealString(params.room)) {
            return callback('Email and room name are required!');
        }

        socket.join(params.room);
        users.logout(socket.id);
        if (users.login(socket.id, params.email, params.room)) {

            io.to(params.room).emit('updateUserList', users.getUserList(params.room));

            socket.emit('newMessage', generateMessage(SYSTEM_MESSAGE_NAME, 'Welcome to the chat app'));
            socket.broadcast.to(params.room).emit('newMessage', generateMessage(SYSTEM_MESSAGE_NAME, `${params.email} has joined.`));
            callback();
        } else {
            return callback('Go away, you are not one of us =))');
        }
    });

    socket.on('createMessage', (message, callback) => {
        let user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.nickname, message.text));
        
        }

        callback();
    });

    socket.on('disconnect', () => {
        let user = users.logout(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage(SYSTEM_MESSAGE_NAME, `${user.nickname} has left.`));
        }
    });
});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});