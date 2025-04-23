const { Server } = require("socket.io");
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinPartnerRoom", (partnerId) => {
      socket.join(partnerId);
      console.log(`Partner ${partnerId} joined`);
    });
  });
}

function notifyPartner(partnerId, data) {
  if (io) {
    io.to(partnerId).emit("newSubOrder", data);
  }
}

module.exports = { initSocket, notifyPartner };
