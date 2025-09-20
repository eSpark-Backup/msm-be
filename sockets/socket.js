const { Server } = require("socket.io");
const EventEmitter = require("events");

class SocketService extends EventEmitter {
  constructor() {
    super();
    this.io = null;
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log("connected socket:", socket.id);

      // example listener
      socket.on("hello", (data) => {
        console.log("hello from client:", data);
      });

      // send to this client only
      socket.emit("hello", { msg: "Hi from server!" });

      socket.on("disconnect", () => {
        console.log("disconnected socket:", socket.id);
      });
    });

    return this.io;
  }

  getIO() {
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    return this.io;
  }

  emitToClients(event, data) {
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    this.io.emit(event, data);
  }

  to(room) {
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    return this.io.to(room);
  }
}

module.exports = new SocketService();
