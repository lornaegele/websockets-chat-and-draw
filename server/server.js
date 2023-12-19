const { instrument } = require("@socket.io/admin-ui");
const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:4200", "https://admin.socket.io"],
    credentials: true,
  },
});

const createdRooms = {};

const chatIo = io.of("/chat");
const skribbleIo = io.of("/skribble");

chatIo.on("connection", (socket) => {
  socket.on("send-message", (message, userName, room, date, userId) => {
    socket.to(room).emit("receive-message", message, userName, date, userId);
  });
  socket.on("join-room", (room, userName) => {
    socket.join(room);
    socket.to(room).emit("user-joined", userName);
  });
  socket.on("leave-room", (room, userName) => {
    socket.leave(room);
    socket.to(room).emit("user-left", userName);
  });
  socket.on("send-is-typing", (userName, room, date, isTyping, userId) => {
    socket.to(room).emit("receive-is-typing", userName, date, isTyping, userId);
  });
});

skribbleIo.on("connection", (socket) => {
  socket.on("send-drawing", (room, userName, stroke) => {
    socket.to(room).emit("receive-drawing", userName, stroke);
  });
  socket.on("send-resetdrawing", (room, message) => {
    socket.to(room).emit("receive-resetdrawing", message);
  });
  socket.on("join-room", (room, userName) => {
    if (!createdRooms[room]) {
      socket.join(room);
      createdRooms[room] = true;
      socket.emit("room-created");
    } else {
      socket.join(room);
      socket.to(room).emit("user-joined", userName);
    }
  });
  socket.on("leave-room", (room, userName) => {
    socket.leave(room);
    socket.to(room).emit("user-left", userName);
  });
});

instrument(io, {
  auth: false,
});
