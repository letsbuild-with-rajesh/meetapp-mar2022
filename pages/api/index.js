import { Server } from 'socket.io'

const meets = {};

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    io.on('connection', socket => {
      socket.on("join-room", (meetParams) => {
        const { username, meet_name, meet_id, peer_id } = meetParams;
        socket.join(meet_id);
        if (!meets[meet_id]) {
          meets[meet_id] = { meet_name, users: {} }
        }
        meets[meet_id].users[peer_id] = username;

        const usersInMeet = [];
        Object.keys(meets[meet_id].users).map((peerId)=>{
          if (peerId !== peer_id) {
            usersInMeet.push({ peer_id: peerId, username: meets[meet_id].users[peerId] });
          }
        });

        socket.emit("sync-existing-users", usersInMeet);
        socket.broadcast.to(meet_id).emit('new-user-connected', { username, peer_id });
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