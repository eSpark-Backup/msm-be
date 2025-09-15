const { Server } = require("socket.io");

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // allow all origins for dev, restrict in prod
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("connected socket:", socket.id);

    socket.on("hello", (data) => {
      console.log("hello from client:", data);
    });

    socket.emit("hello", { msg: "Hi from server!" });


    socket.on("disconnect", () => {
      console.log("disconnected socket:", socket.id);
    });
  });

};
