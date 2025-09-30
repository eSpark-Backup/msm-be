const { Server } = require("socket.io");
const EventEmitter = require("events");
const ProtocolInterval = require('../intervals/protocolInterval');

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
      
      // Track protocol intervals for this socket
      const protocolIntervals = [];

      socket.on("hello", (data) => {
        console.log("hello from client:", data);
      });

      socket.on('mqtt_protocol' , async (data) => {
        console.log("mqtt_protocol from client:", data)
        const interval = new ProtocolInterval(data.interval_time , data.thing_name , data.data_range , socket)
        protocolIntervals.push(interval);
      })

      socket.emit("hello", { msg: "Hi from server!" });

      socket.on("disconnect", () => {
        console.log("disconnected socket:", socket.id);
        // Cleanup all protocol intervals for this socket
        protocolIntervals.forEach(interval => interval.cleanup());
        protocolIntervals.length = 0;
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
