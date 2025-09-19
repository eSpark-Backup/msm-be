// test-socket.js
const { io } = require("socket.io-client");

const socket = io("http://51.20.89.127:5000", {
  transports: ["websocket"], 
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  // test event
  socket.emit("hello", { msg: "Hi from client!" });

  socket.on("hello", (data) => {
    console.log("hello from server:", data);
  });

  // common telemetry
  socket.on("telemetry", (data) => {
    console.log("telemetry (all devices/channels):", data);
  });

  // specific device + channel listener
  socket.on("telemetry:ESP90000005:channel:1", (data) => {
    console.log("telemetry for ESP90000005 channel 1:", data);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
