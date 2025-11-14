// test-socket.js
const { io } = require("socket.io-client");

// const socket = io("https://api.eincloud.ai/", {
//   transports: ["websocket"], 
// });

const socket = io("http://localhost:5000", {
  transports: ["websocket"], 
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  // test event
  socket.emit("hello", { msg: "Hi from client!" });

  // socket.on("mqtt_protocol" , (data) => {
  //   console.log("mqtt_protocol from server:", data);
  // });

  // socket.on("telemetry:ESP00000003:channels:all", (data) => {
  //   console.log("channels data all:");
  //   console.log(data)
  // });

  socket.on("hello", (data) => {
    console.log("hello from server:", data);
  });

  // common telemetry
  // socket.on("telemetry:ESP90000005:channels:1to6", (data) => {
  //   console.log("channels data 1 to 6:");
  //   console.log(data)
  // });

  // socket.on("telemetry:ESP90000005:channels:7to12", (data) => {
  //   console.log("channels data 7 to 12:");
  //   console.log(data)
  // });

  // specific device + channel listener
  // socket.on("telemetry:ESP90000005:channel:1", (data) => {
  //   console.log("telemetry for ESP90000005 channel 1:", data);
  // });




  // socket.on("device_info:ESP90000005", (data) => {
  //   console.log("device_info from server:", data);
  // });

  // socket.on("ntp_info:ESP90000005", (data) => {
  //   console.log("ntp_info from server:", data);
  // });

  // socket.on("mqtt_info:ESP90000005", (data) => {
  //   console.log("mqtt_info from server:", data);
  // });

  // socket.on("sftp_info:ESP90000005", (data) => {
  //   console.log("sftp_info from server:", data);
  // });

  // socket.on("device_status_updated", (data) => {
  //   console.log("device_status_updated from server:", data);
  // });

    // socket.emit("mqtt_protocol" , { thing_name : "ESP90000005" , interval_time : 10000 , data_range : 10 });


  //   socket.on("mqtt_protocol" , (data) => {
  //   console.log("mqtt_protocol from server:", data);
  // });

  // socket.on("ota_info:ESP90000005", (data) => {
  //   console.log("ota_info from server:", data);
  // });

  // socket.on("mqtts_info:ESP90000005", (data) => {
  //   console.log("mqtts_info from server:", data);
  // });

  socket.on("about:ESP90000005", (data) => {
    console.log("about from server:", data);
  });

  socket.on("measurements:ESP90000005", (data) => {
    console.log("measurements from server:", data);
  });



  // socket.emit("mqtt_protocol_stop" , { thing_name : "ESP90000005" });
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
