import { Server } from 'socket.io'

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    io.on('connection', socket => {
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