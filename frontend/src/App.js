import React, { useEffect, useState } from 'react';
import './App.css';
import { io } from "socket.io-client";

function useSocket(url) {
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    const newSocket = io(url);
    newSocket.on("connect", () => {
      console.log("connected to " + newSocket.id);
      setSocketId(newSocket.id);
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [url]);

  return { socket, socketId };
}

function App() {
  const { socket, socketId } = useSocket("http://localhost:4000");

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [roomInput, setRoomInput] = useState('');

  useEffect(() => {
    if (socket) {
      // Listen for 'receive-message' event from the server
      socket.on('receive-message', (message) => {
        setMessages([...messages, message]); // Update local state with the received message
      });
    }
  }, [socket, messages]); // Ensure to include 'messages' in the dependency array to handle updates correctly

  const handleSubmit = (event) => {
    event.preventDefault();
    if (messageInput.trim() !== '') {
      // Emit message to the server
      socket.emit('send-message', { message: messageInput, room: roomInput });
      // Update local state
      setMessages([...messages, messageInput]);
      setMessageInput('');
    }
  };

  const joinRoom = () => {
    console.log('Joined room:', roomInput);
    socket.emit('join-room', roomInput);
  };

  if (!socket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Hello {socketId}</h1>
      <div id="message-container">
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <form id="form" onSubmit={handleSubmit}>
        <label htmlFor="message-input">Message</label>
        <div className="form-container">
          <input type="text" id="message-input" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
          <button type="submit" id="send-button">Send</button>
        </div>
        <div className="form-container">
          <input type="text" id="room-input" value={roomInput} onChange={(e) => setRoomInput(e.target.value)} />
          <button type="button" id="room-button" onClick={joinRoom}>Join</button>
        </div>

      </form>
    </div>
  );
}

export default App;
