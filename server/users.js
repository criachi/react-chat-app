// Managing users: which ones signed in/out, which ones are in what room, etc...
const users = [];

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find(
        (user) => user.room === room && user.name === name
    );

    if (existingUser) {
        return { error: 'Username is taken' };
    }

    const user = { id, name, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0]; // remove that user from our array
    }

    // else index === -1 meaning user does not exist
    return { error: 'User does not exist. Cannot be removed' };
};

const getUser = (id) => {
    const foundUser = users.find((user) => user.id === id);
    if (!foundUser) {
        return { error: 'User does not exist.' };
    }
    return foundUser;
};

const getUsersInRoom = (room) => {
    users.filter((user) => {
        user.room === room;
    });
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
