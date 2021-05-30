const express = require('express');
const socketio = require('socket.io');
const http = require('http'); // built-in node module
//const cors = require('cors');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
// Setup socket.io instance
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});

// middleware
app.use(router);

server.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});

// Detecting client connections and disconnections using socket.io library
// Upon client connection request, open up a socket
io.on('connection', (socket) => {
    // all code to manage the socket that connected goes in this code block
    console.log('We have a new connection!');

    socket.on('join', ({ name, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, name, room });
        // using callback argument can trigger an action after the socket event is detected and processed, like error handling
        if (error) {
            callback({ error: 'error' });
        }

        // admin-generated messaging events
        socket.emit('message', {
            user: 'admin',
            text: `Hi ${user.name}, welcome to room ${user.room}!`
        });
        // sends a message to everyone besides the specific user who just joined (ie besides the specific socket we are defining this functionality on)
        socket.broadcast.to(user.room).emit('message', {
            user: 'admin',
            text: `${user.name} has joined!`
        });
        // joins a user into a room
        socket.join(user.room);
    });

    // user-generated messages
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        // send message to the chat room
        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });
    socket.on('disconnect', () => {
        console.log('User has disconnected!');
        // below code snippet is important because without it, when user refreshes chat page after having sent a message,
        // the join event we listen for will trigger an addUser, but if we do not remove user from our list of users,
        // addUser will not add a duplicate user back,
        // and hence in the join code snippet above, addUser will return an undefined user
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', {
                user: 'admin',
                text: `${user.name} has left`
            });
        }
    });
});
