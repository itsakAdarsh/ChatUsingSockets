const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(cors())

io.on('connection', (socket) => {
  console.log('A user connected');
  console.log(socket.id);

  // Listen for new messages from the client
  socket.on('send-message', (data) => {
    if(data.room == ""){
        socket.broadcast.emit("receive-message", data.message); // Broadcast message to all connected clients
    }
    else{
        socket.to(data.room).emit("receive-message", data.message);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
server.listen(4000, () => {
  console.log('Server listening on port 4000');
});
