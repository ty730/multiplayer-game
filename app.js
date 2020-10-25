"use strict";

const express = require("express");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 3000;
const INDEX = "/public/index.html";

const server = express()
  .use(express.static("public"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

const users = {};
const players = {};

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("new-user", name => {
    users[socket.id] = name;
    if (Object.keys(users).length < 3) {
      if (players.hasOwnProperty("one")) {
        players.two = socket.id;
        players[socket.id] = 2;
      } else {
        players.one = socket.id;
        players[socket.id] = 1;
      }
    }
    socket.emit("new-player", {"users": users, "id": socket.id, "num": players[socket.id], "name": name});
    socket.broadcast.emit("user-connected", name);
  });

  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {"message": message, "name": users[socket.id]});
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id]
  })
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);