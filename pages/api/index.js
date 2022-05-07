import { Server } from 'socket.io'

const users = {};

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    io.on('connection', socket => {
      socket.on("join-room", (roomId, peerId) => {
        if (!users[roomId]) users[roomId] = [];

        users[roomId].push(socket.id);
        const usersInThisRoom = users[roomId].filter(id => id !== socket.id);

        socket.emit("other-users-in-room", usersInThisRoom);
        socket.broadcast.emit('new-user-connected', peerId)
      });
    })
    res.socket.server.io = io
  } else {
    console.log('socket is already opened')
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default socketHandler