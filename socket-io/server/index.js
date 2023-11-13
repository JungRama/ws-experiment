const io = require('socket.io')(8000, {
  cors: {
    origin: ['http://127.0.0.1:5173']
  }
})

// Create a namespace for '/user'
const userIo = io.of('/user')

// Handle connection event for the '/user' namespace
userIo.on('connection', socket => {
  console.log(`connected user ${socket.username}`);
})

// Middleware function to authenticate the socket connection
userIo.use((socket, next) => {
  // Check if the socket has a valid token
  if(socket.handshake.auth.token) {
    socket.username = getUserInfoFromToken(socket.handshake.auth.token)
    next()
  } else {
    next(new Error('please send token!'))
  }
})

// Function to extract user information from token
function getUserInfoFromToken(token) {
  return token + ' username'
}

// Handle connection event for the default namespace '/'
io.on('connection', (socket) => {
  // Handle 'send-message' event
  socket.on('send-message', (message, room) => {
    if(room === 'BROADCAST') {
      // Broadcast the message to all connected sockets except the sender
      socket.broadcast.emit('receive-message', message)
    } else {
      // Send the message to all sockets in the specified room
      socket.to(room).emit('receive-message', message)
    }
  })

  // Handle 'join-room' event
  socket.on('join-room', (room, callback) => {
    // Join the specified room
    socket.join(room)
    if(callback) {
      // Invoke the callback function with a message
      callback('user joining room!')
    }
  })
})