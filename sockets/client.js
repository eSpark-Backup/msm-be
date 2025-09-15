// test-socket.js
const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  transports: ["websocket"], 
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // test event
  socket.emit("hello", { msg: "Hi from client!" });

  socket.on("hello", (data) => {
    console.log("hello from server:", data);
  });
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});
