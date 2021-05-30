import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import './Chat.css';

let socket;

// location is a prop from react-router-dom: it is the query string in the url
const Chat = ({ location }) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userList, setUsers] = useState([]);
    const ENDPOINT = 'https://react-chat-app-backend1.herokuapp.com/';
    useEffect(() => {
        console.log('initial useeffect');
        const { name, room } = queryString.parse(location.search);

        socket = io(ENDPOINT);

        setName(name);
        setRoom(room);

        // emitting custom join event to socket
        // sending payload
        socket.emit('join', { name, room }, ({ error }) => {
            alert(error);
        });

        // used for unmounting, cleanup
        return () => {
            socket.emit('disconnect');
            socket.off(); // turns off the single socket instance corresponding to one person
        };
    }, [ENDPOINT, location.search]); // only if either one of these 2 values change do we need to run this hook and re-connect to socket on server
    // prior to adding hook dependencies, the user connection and disconnection were happening twice each

    useEffect(() => {
        console.log('in use effect');
        // listen for an admin message coming from backend
        socket.on('message', (message) => {
            console.log('in callback');
            setMessages((messages) => [...messages, message]); // w/out function syntax had weird behavior
        });
    }, []);

    // function for sending messages
    const sendMessage = (event) => {
        event.preventDefault(); // default behavior in keypress is to refresh entire page which is not good, so we prevent it
        if (message) {
            socket.emit('sendMessage', message, () => {
                setMessage('');
            });
        }
    };
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room}></InfoBar>
                <Messages messages={messages} name={name}></Messages>
                <Input
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                ></Input>
            </div>
        </div>
    );
};

export default Chat;
